// src/services/ocrService.ts
// OCR service using PaddleOCR via external Python service

import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Extract text from image using OCR
 */
export async function extractTextFromImage(imageBuffer: Buffer): Promise<{
    text: string;
    confidence: number;
}> {
    if (env.USE_MOCK_OCR) {
        return mockOCR();
    }

    return paddleOCR(imageBuffer);
}

/**
 * Mock OCR for development
 */
function mockOCR(): { text: string; confidence: number } {
    logger.info('Using mock OCR service');

    const mockText = `
ENGINEERING COLLEGE EXAMINATION
SEMESTER EXAMINATION - MAY 2024

Course: Computer Science Engineering
Subject: Data Structures and Algorithms
Semester: III
Time: 3 Hours
Max Marks: 100

PART - A (10 x 2 = 20 Marks)
Answer ALL questions

1. Define an algorithm and list its properties. (2 marks) - Topic: Introduction to Algorithms
2. What is time complexity? Give examples. (2 marks) - Topic: Algorithm Analysis
3. Explain the difference between stack and queue. (2 marks) - Topic: Linear Data Structures
4. What is a binary search tree? (2 marks) - Topic: Trees
5. Define graph and its types. (2 marks) - Topic: Graph Theory
6. What is hashing? (2 marks) - Topic: Hashing
7. Explain recursion with an example. (2 marks) - Topic: Recursion
8. What is a linked list? (2 marks) - Topic: Linked Lists
9. Define sorting. Name any two sorting algorithms. (2 marks) - Topic: Sorting Algorithms
10. What is dynamic programming? (2 marks) - Topic: Dynamic Programming

PART - B (5 x 16 = 80 Marks)
Answer ALL questions

11. a) Explain the different asymptotic notations used in algorithm analysis. (16 marks) - Topic: Algorithm Analysis
    OR
    b) Write an algorithm for binary search and analyze its time complexity. (16 marks) - Topic: Searching Algorithms

12. a) Implement a stack using arrays and explain all operations. (16 marks) - Topic: Stacks
    OR
    b) Explain circular queue with implementation. (16 marks) - Topic: Queues

13. a) Explain different tree traversal techniques with examples. (16 marks) - Topic: Tree Traversals
    OR
    b) Implement AVL tree rotations. (16 marks) - Topic: Balanced Trees

14. a) Explain Dijkstra's shortest path algorithm. (16 marks) - Topic: Graph Algorithms
    OR
    b) Implement BFS and DFS for graphs. (16 marks) - Topic: Graph Traversals

15. a) Explain merge sort algorithm with time complexity analysis. (16 marks) - Topic: Sorting Algorithms
    OR
    b) Explain the 0/1 knapsack problem using dynamic programming. (16 marks) - Topic: Dynamic Programming
  `;

    return {
        text: mockText,
        confidence: 0.95,
    };
}

/**
 * Real OCR using PaddleOCR Python service
 */
async function paddleOCR(imageBuffer: Buffer): Promise<{
    text: string;
    confidence: number;
}> {
    try {
        logger.info('Sending image to PaddleOCR service...');

        // Create form data with the image
        const formData = new FormData();
        const blob = new Blob([imageBuffer], { type: 'image/png' });
        formData.append('file', blob, 'image.png');

        // Call the Python OCR service
        const response = await fetch(`${env.OCR_SERVICE_URL}/ocr`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OCR service error: ${response.status} - ${errorText}`);
        }

        const result = await response.json() as { text: string; confidence: number };

        logger.info(`PaddleOCR completed with ${(result.confidence * 100).toFixed(2)}% confidence`);
        logger.info(`Extracted ${result.text.length} characters`);

        return {
            text: result.text.trim(),
            confidence: result.confidence,
        };
    } catch (error) {
        logger.error('PaddleOCR service error:', error);
        throw error;
    }
}

export default {
    extractTextFromImage,
};
