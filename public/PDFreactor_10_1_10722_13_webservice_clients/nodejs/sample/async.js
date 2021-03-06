const PDFreactor = require("../lib/PDFreactor.js");
const fs = require('fs');
const path = require('path');

// Create new PDFreactor instance
// var pdfReactor = new PDFreactor("http://yourServer:9423/service/rest");
var pdfReactor = new PDFreactor("https://cloud.pdfreactor.com/service/rest");

fs.readFile('../../resources/contentNodeJs.html', 'utf8', async (error, content) => {
    if (error) {
        return console.log(error);
    }

    // Construct the base URL, using the current path.
    var basePath = path.resolve(".");
    if (!basePath.startsWith("/")) {
        basePath = "file:///" + basePath.replace(/\\/g, "/");
    } else {
        basePath = "file://" + basePath;
    }
    if (!basePath.endsWith("/")) {
        basePath += "/";
    }

    var config = {
        document: content,
        // Set a base URL for images, style sheets, links
        baseURL: basePath,
        // Set an appropriate log level
        logLevel: PDFreactor.LogLevel.WARN,
        // Set the title of the created PDF
        title: "Demonstration of the PDFreactor JavaScript API",
        // Set the author of the created PDF
        author: "Myself",
        // Enable links in the PDF document
        addLinks: true,
        // Enable bookmarks in the PDF document
        addBookmarks: true,
        // Set some viewer preferences
        viewerPreferences: [
            PDFreactor.ViewerPreferences.FIT_WINDOW,
            PDFreactor.ViewerPreferences.PAGE_MODE_USE_THUMBS
        ],
        // Add user style sheets
        userStyleSheets: [
            {
                content: "@page {" +
                             "@top-center {" +
                                 "content: 'PDFreactor Node.js API demonstration';" +
                             "}" +
                             "@bottom-center {" +
                                 "content: 'Created on " + new Date().toLocaleString() + "';" +
                             "}" +
                         "}"
            },
            { uri: "../../resources/common.css" }
        ]
    }

    try {
        // Convert document
        const documentId = await pdfReactor.convertAsync(config);
        let progress = null;

        do {
            await sleep(0.1);
            progress = await pdfReactor.getProgress(documentId);

            console.log(progress.progress + "%");
        } while (!progress.finished);

        // Streaming is more efficient for larger documents
        const stream = fs.createWriteStream('async.pdf', 'binary');
        await pdfReactor.getDocumentAsBinary(documentId, stream);

        console.log("Conversion completed.");
    } catch (error) {
        console.log(error);
    }
});

function sleep(seconds) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1000 * seconds);
    });
}
