export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    isLoading = true;
    try {
        // Fix 1: Use the correct import path
        loadPromise = import("pdfjs-dist").then((lib) => {
            // Fix 2: Set worker source using CDN (more reliable)
            lib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/pdf.worker.min.js`;

            // Alternative: If you want to use local worker file, make sure the file exists in public folder
            // lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

            pdfjsLib = lib;
            isLoading = false;
            return lib;
        }).catch((error) => {
            console.error("Failed to load PDF.js:", error);
            isLoading = false;
            throw error;
        });

        return loadPromise;
    } catch (error) {
        isLoading = false;
        loadPromise = null;
        throw error;
    }
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        const lib = await loadPdfJs();

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        // Fix 3: Reduce scale for better performance and compatibility
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
            return {
                imageUrl: "",
                file: null,
                error: "Failed to get canvas context",
            };
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Fix 4: Check if imageSmoothingEnabled exists before using it
        if ('imageSmoothingEnabled' in context) {
            context.imageSmoothingEnabled = true;
            if ('imageSmoothingQuality' in context) {
                context.imageSmoothingQuality = "high";
            }
        }

        await page.render({ canvasContext: context, viewport }).promise;

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        // Create a File from the blob with the same name as the pdf
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File([blob], `${originalName}.png`, {
                            type: "image/png",
                        });

                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                    } else {
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Failed to create image blob",
                        });
                    }
                },
                "image/png",
                0.95 // Fix 5: Slightly reduce quality for better performance
            );
        });
    } catch (err) {
        console.error("PDF conversion error:", err);
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${err instanceof Error ? err.message : String(err)}`,
        };
    }
}