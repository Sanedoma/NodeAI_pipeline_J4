import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { text } from 'stream/consumers';

export const CONFIG = {
    chunkSize: 400,
    overlap: 50,
    batchSize: 50,
    embedConcurrency: 5
};

export function chunkWithOverlap(text, chunkSize, overlap) {

    if (!text || text.trim().length === 0) {
        return [];
    }

    if (overlap >= chunkSize) {
        throw new Error(
        'overlap doit être inférieur à chunkSize'
        );
    }

    const words = text.split(' ');

    const chunks = [];

    let i = 0;

    while (i < words.length) {

        const chunk = words
        .slice(i, i + chunkSize)
        .join(' ');

        if (chunk.trim().length > 0) {
        chunks.push(chunk);
        }

        i += chunkSize - overlap;
    }

    return chunks;
}

export function loadCorpus(dir){
    const files = readdirSync(dir)
        .filter(file => 
            file.endsWith('.txt') ||
            file.endsWith('.md')
        );
    
        return files.map(file => ({
            filename: file,
            text: readFileSync( join(dir, file), 'utf-8' )
        }));
}