import { saveAs } from 'file-saver';
import DOMPurify from 'dompurify';
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  TextRun,
} from "docx";

// content.js - Document Template Generator Modal
class SmartTemplateGenerator {
    constructor() {
        this.currentTemplate = '';
        this.currentPrompt = '';

        this.initializeKeyboardShortcuts();
    }

    async injectModal() {
        const res = await fetch(chrome.runtime.getURL('modalTemplate.html'));
        const html = await res.text();
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        document.body.appendChild(wrapper);
    }

    sanitizeUserInput(input) {
        // Remove script/style tags, HTML tags, and trim whitespace
        let sanitized = input.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
                            .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
                            .replace(/<\/?[^>]+(>|$)/g, '')
                            .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width chars
                            .trim();
        // Optionally, escape special HTML characters
        sanitized = sanitized.replace(/&/g, "&amp;")
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;")
                            .replace(/"/g, "&quot;")
                            .replace(/'/g, "&#039;");
        return sanitized;
    }

    async openTemplateGeneratorModal() {
        console.info("Opening template!!!");

        const existingModal = document.getElementById('template-generator-modal');
        if (existingModal) existingModal.remove();

        await this.injectModal();

        this.initializeTabs();

        // Bind modal-specific buttons
        setTimeout(() => {
            document.getElementById('generate-btn')?.addEventListener('click', () => this.generateTemplate());
            document.getElementById('clear-btn')?.addEventListener('click', () => this.clearInput());
            document.querySelector('.close-btn')?.addEventListener('click', () => this.closeTemplateGeneratorModal());

            document.getElementById('prompt-input')?.focus();

            document.querySelector('[onclick*="copyTemplate"]')?.addEventListener('click', () => this.copyTemplate());
            document.querySelector('[onclick*="downloadTemplate"]')?.addEventListener('click', () => this.downloadTemplate());
            document.querySelector('[onclick*="modifyTemplate"]')?.addEventListener('click', () => this.modifyTemplate());
        }, 0);
    }

    closeTemplateGeneratorModal() {
        const modal = document.getElementById('template-generator-modal');
        if (modal) modal.remove();
    }

    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');

                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));

                button.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
            });
        });
    }

    async generateTemplate() {
        const promptInput = document.getElementById('prompt-input');
        const generateBtn = document.getElementById('generate-btn');
        const btnText = generateBtn.querySelector('.btn-text');
        const loadingSpinner = generateBtn.querySelector('.loading-spinner');

        const userInput = promptInput.value.trim();

        if (!userInput) {
            this.showStatus('Please enter a prompt to generate a template.', 'error');
            return;
        }

        generateBtn.disabled = true;
        btnText.style.display = 'none';
        loadingSpinner.style.display = 'inline-block';

        this.showStatus('Generating template...', 'info');

        this.currentPrompt = userInput;

        const prompt = `
            You are a professional document formatter.

            Your task is to generate a clean, professional document based on the user's request. The document will be converted into a Microsoft Word (.docx) file, so your formatting must be compatible with that format.

            Use only semantic HTML elements, following these strict rules:
            
            - Do not style anything, no colors either, just plain html elements
            - Use <p> for standard paragraphs.
            - Use <br> only for line breaks within a paragraph, not between paragraphs.
            - Use <h1> to <h3> only for meaningful section titles — not for styling or emphasis. Avoid overuse.
            - Use <strong>, <b>, <em>, and <i> only when emphasis is clearly appropriate.
            - Use <ul>, <ol>, and <li> for lists when the content calls for it.
            - Use a <table> only if the user's request explicitly mentions structured data like a payment schedule, timeline, or invoice. Otherwise, use standard paragraph formatting.
            - Use <table> only when the user's request involves tabular data.
            - Do not include any visual styling: no colors, no inline styles, no classes.
            - Do not use <div>, <span>, <style>, or any non-semantic tags.
            - Do not include <html>, <head>, or <body> tags.
            - Do not use Markdown.
            - Do not label or number paragraphs or sections (e.g., "Paragraph 1:", "Section:", etc.). Write naturally.
            - Do not include commentary, annotations, or explanations.
            - Do not create any section titles or headings unless the user explicitly requests them. Write all text in continuous, natural paragraphs without labeling or numbering any parts.
            - Do not create any headings
            - Do not create any charts, if requested, just describe them in text.

            Preserve all placeholders exactly as written using square brackets (e.g., [clientName]). Do not reformat or alter them.

            ---

            User request:  
            """${userInput}"""
        `;  

        chrome.runtime.sendMessage({action: "DOCUMENT_GENERATION", prompt: prompt}, (response) => {
            generateBtn.disabled = false;
            btnText.style.display = 'inline';
            loadingSpinner.style.display = 'none';

            if (response.success == false) {
                this.showStatus(response.error, 'error');
                console.error('Error generating template:', response.error);
                return;
            }

            this.currentTemplate = response.data;
            this.displayTemplate(response.data);
            this.switchToOutputTab();
            this.showStatus('Template generated successfully', 'success');
        });
    }

    displayTemplate(template) {
        const preview = document.getElementById('template-preview');
        const actionButtons = document.getElementById('action-buttons');

        preview.innerHTML = `<div class="template-content">${DOMPurify.sanitize(template)}</div>`;
        actionButtons.style.display = 'flex';
    }

    switchToOutputTab() {
        const outputTabBtn = document.querySelector('[data-tab="output"]');
        outputTabBtn?.click();
    }

    clearInput() {
        document.getElementById('prompt-input').value = '';
        document.getElementById('prompt-input').focus();
    }

    async copyTemplate() {
        if (!this.currentTemplate) {
            this.showStatus('No template to copy.', 'error');
            return;
        }

        try {
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(this.currentTemplate, 'text/html');

            let result = '';

            // Loop through all <p> elements
            htmlDoc.querySelectorAll('p').forEach(p => {
                let paragraphText = '';

                // Split on <br> and add line breaks
                p.innerHTML.split(/<br\s*\/?>/i).forEach((line, index, arr) => {
                    const cleanedLine = line.replace(/&nbsp;/g, ' ').trim();
                    if (cleanedLine.length > 0) {
                        paragraphText += cleanedLine;
                    }
                    if (index < arr.length - 1) {
                        paragraphText += '\n'; // single newline for line breaks
                    }
                });

                // Add paragraph to result with double newline after
                if (paragraphText.length > 0) {
                    result += paragraphText + '\n\n'; // double newline for paragraph spacing
                }
            });

            result = result.trim(); // Clean trailing newlines

            await navigator.clipboard.writeText(result);
            this.showStatus('Template copied to clipboard!', 'success');
        } catch (error) {
            console.error('Error copying template:', error);
            this.showStatus('Failed to copy template to clipboard.', 'error');
        }
    }

   async downloadTemplate(filename = "document.docx") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.currentTemplate, "text/html");

    // Helper: consistent paragraph formatting
    const createParagraph = (text, options = {}) =>
        new Paragraph({
        spacing: { after: 0, line: 240 }, // single line spacing, 0pt after
        children: [
            new TextRun({
            text: text,
            font: "Times New Roman",
            size: 24,
            ...options,
            }),
        ],
        });

    // Blank line
    const blankLine = new Paragraph({
        spacing: { after: 0, line: 240 },
        children: [new TextRun({ text: "", size: 24 })],
    });

    const createHeading = (text, level) =>
        new Paragraph({
        heading: level,
        spacing: { after: 0, line: 240 },
        children: [
            new TextRun({
            text: text,
            font: "Times New Roman",
            size: 24,
            bold: true,
            }),
        ],
    });

    // Recursive function to process all nodes, including nested ones
    function processNode(node, children) {
        switch (node.nodeName) {
        case "H1":
            children.push(createHeading(node.textContent.trim(), HeadingLevel.HEADING_1));
            children.push(blankLine);
            break;
        case "H2":
            children.push(createHeading(node.textContent.trim(), HeadingLevel.HEADING_2));
            children.push(blankLine);
            break;
        case "H3":
            children.push(createHeading(node.textContent.trim(), HeadingLevel.HEADING_3));
            children.push(blankLine);
            break;
        case "P": {
            const runs = [];
            node.childNodes.forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
                runs.push(
                new TextRun({
                    text: child.textContent.trim(),
                    font: "Times New Roman",
                    size: 24,
                })
                );
            } else if (child.nodeName === "BR") {
                runs.push(new TextRun({ break: 1 }));
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                runs.push(
                new TextRun({
                    text: child.textContent.trim(),
                    font: "Times New Roman",
                    size: 24,
                })
                );
            }
            });

            children.push(
            new Paragraph({
                spacing: { after: 0, line: 240 },
                children: runs,
            })
            );

            children.push(blankLine);
            break;
        }
        case "UL":
        case "OL": {
            const isOrdered = node.nodeName === "OL";
            const items = node.querySelectorAll("li");

            items.forEach((li) => {
            children.push(
                new Paragraph({
                spacing: { after: 0, line: 240 },
                children: [
                    new TextRun({
                    text: li.textContent.trim(),
                    font: "Times New Roman",
                    size: 24,
                    }),
                ],
                bullet: isOrdered ? undefined : { level: 0 },
                numbering: isOrdered
                    ? {
                        reference: "numbered-list",
                        level: 0,
                    }
                    : undefined,
                indent: { left: 720 },
                })
            );
            children.push(blankLine);
            });
            break;
        }
        case "TABLE": {
            const thead = node.querySelector("thead");
            const tbody = node.querySelector("tbody");

            if (!thead || !tbody) break;

            const headers = Array.from(thead.querySelectorAll("th")).map(th =>
                th.textContent.trim()
            );

            const columnCount = headers.length;

            const rows = Array.from(tbody.querySelectorAll("tr")).map(tr =>
                Array.from(tr.querySelectorAll("td")).map(td => ({
                    text: td.textContent.trim(),
                    colspan: parseInt(td.getAttribute("colspan") || "1", 10),
                }))
            );

            const tableRows = [];

            // Header row with shading
            tableRows.push(
                new TableRow({
                    children: headers.map(header =>
                        new TableCell({
                            children: [createParagraph(header, { bold: true })],
                            shading: { fill: "D9D9D9" },
                            verticalAlign: "center",
                        })
                    ),
                    tableHeader: true,
                })
            );

            // Body rows with colspan support and balancing cells
            rows.forEach(row => {
                const rowCells = [];
                let colTracker = 0;

                row.forEach(cell => {
                    rowCells.push(
                        new TableCell({
                            children: [createParagraph(cell.text)],
                            verticalAlign: "top",
                            columnSpan: cell.colspan > 1 ? cell.colspan : undefined,
                        })
                    );
                    colTracker += cell.colspan;
                });

                // Fill remaining columns if row is short
                while (colTracker < columnCount) {
                    rowCells.push(
                        new TableCell({
                            children: [createParagraph("")],
                            verticalAlign: "top",
                        })
                    );
                    colTracker++;
                }

                tableRows.push(new TableRow({ children: rowCells }));
            });

            children.push(
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: tableRows,
                })
            );

            children.push(blankLine);
            break;
        }
        default:
            // Recursively process child nodes if any
            if (node.childNodes && node.childNodes.length) {
            node.childNodes.forEach((childNode) => processNode(childNode, children));
            }
            break;
        }
    }

    const children = [];
    Array.from(doc.body.childNodes).forEach((node) => processNode(node, children));

    const docxDocument = new Document({
        sections: [{ children }],
        numbering: {
        config: [
            {
            reference: "numbered-list",
            levels: [
                {
                level: 0,
                format: "decimal",
                text: "%1.",
                alignment: "left",
                },
            ],
            },
        ],
        },
    });

    const blob = await Packer.toBlob(docxDocument);
    saveAs(blob, filename);
    }

    modifyTemplate() {
        const promptInput = document.getElementById('prompt-input');
        const inputTabBtn = document.querySelector('[data-tab="input"]');
        inputTabBtn?.click();

        const modificationPrompt = `Please modify this previous template:\n\nOriginal: "${this.currentTemplate}"\n\nChanges needed: `;

        setTimeout(() => {
            promptInput.value = modificationPrompt;
            promptInput.focus();
            promptInput.setSelectionRange(promptInput.value.length, promptInput.value.length);
        }, 100);
    }

    showStatus(message, type = 'success') {
        const statusElement = document.getElementById('status-message');

        if (!statusElement) {
            console.error('Status element not found');
            return;
        }

        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        statusElement.style.display = 'block';

        const hideDelay = type === 'error' ? 8000 : 5000;
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, hideDelay);
    }

    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('template-generator-modal');
            if (!modal) return;

            if (e.key === 'Escape') {
                this.closeTemplateGeneratorModal();
            }

            if (e.ctrlKey && e.key === 'Enter') {
                const activeTab = document.querySelector('.tab-pane.active');
                if (activeTab?.id === 'input-tab') {
                    this.generateTemplate();
                }
            }
        });
    }
}

// Instantiate class
const templateGenerator = new SmartTemplateGenerator();

// Hook into Chrome Extension message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'OPEN_TEMPLATE_GENERATOR') {
        console.log("MODAL TRIGGER RETRIEVED");
        templateGenerator.openTemplateGeneratorModal();
        sendResponse({ success: true });
    }
});