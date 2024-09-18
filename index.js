
const fs = require('fs');
const { ImageAnalysisClient } = require("@azure-rest/ai-vision-image-analysis");
const createClient = require("@azure-rest/ai-vision-image-analysis").default;
const { AzureKeyCredential } = require('@azure/core-auth');

//Load the environment variables
require('dotenv').config();

const key = process.env.MY_API_KEY1;
const endpoint = process.env.MY_ENDPOINT;
const credential = new AzureKeyCredential(key);

const client = createClient(endpoint, credential);

const feature = ['Read'];

// Analyze images by URL
async function analyzeImageURL(url) {
    const imageUrl = url;

    const result = await client.path('/imageanalysis:analyze').post({
        body: { url: imageUrl },
        queryParameters: { features: feature },
        contentType: 'application/json'
    });

    const iaResult = result.body;

    // Process the response
    if (iaResult.readResult.blocks.length > 0) {
        iaResult.readResult.blocks.forEach(block => {
            block.lines.forEach(line => {
                console.log(`Detected text line: ${line.text}`);
            })
        });
    } else {
        console.log('No text blocks detected');
    }
}

//Analyze images from local storage
async function analyzeImageLocal(imagePath) {
    const imageStream = fs.createReadStream(imagePath);
    const imageSize = fs.statSync(imagePath).size;

    const result = await client.path('/imageanalysis:analyze').post({
        headers: { 'Content-Length': imageSize },
        body: imageStream,
        queryParameters: { 
            features: feature, 
            'smartCrops-aspect-ratios': [0.9, 1.33]
        }, 
        contentType: 'application/octet-stream'
    });

    const iaResult = result.body;

    // Process the response
    if (iaResult.readResult) {
        iaResult.readResult.blocks.forEach(block => {
            block.lines.forEach(line => {
                console.log(`Detected text line: ${line.text}`);
            })
        });
    } else {
        console.log('No text blocks detected');
    }
}

analyzeImageLocal(imagePath);
analyzeImageURL('https://aka.ms/azsdk/image-analysis/sample.jpg');