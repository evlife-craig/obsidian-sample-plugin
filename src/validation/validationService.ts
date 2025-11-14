import { ValidationError } from '../types';

/**
 * Service for managing validation errors from custom table loading
 * Provides centralized error storage and retrieval
 */
export class ValidationService {
    private errors: Map<string, ValidationError[]>;

    constructor() {
        this.errors = new Map();
    }

    /**
     * Add validation errors for a specific file
     * @param file - File path
     * @param errors - Array of validation errors
     */
    addErrors(file: string, errors: ValidationError[]): void {
        if (errors.length === 0) {
            return;
        }
        this.errors.set(file, errors);
    }

    /**
     * Clear all validation errors for a specific file
     * @param file - File path
     */
    clearErrors(file: string): void {
        this.errors.delete(file);
    }

    /**
     * Get validation errors for a specific file
     * @param file - File path
     * @returns Array of validation errors, or empty array if none exist
     */
    getErrorsForFile(file: string): ValidationError[] {
        return this.errors.get(file) || [];
    }

    /**
     * Get all validation errors across all files
     * @returns Array of all validation errors
     */
    getAllErrors(): ValidationError[] {
        const allErrors: ValidationError[] = [];
        for (const errors of this.errors.values()) {
            allErrors.push(...errors);
        }
        return allErrors;
    }

    /**
     * Check if any validation errors exist
     * @returns True if there are any errors, false otherwise
     */
    hasErrors(): boolean {
        return this.errors.size > 0;
    }

    /**
     * Format validation errors for display in the UI
     * Groups errors by file and formats them in a user-friendly way
     * @returns Formatted error message string
     */
    formatErrorsForDisplay(): string {
        if (!this.hasErrors()) {
            return 'No validation errors';
        }

        const lines: string[] = [];
        
        for (const [file, errors] of this.errors.entries()) {
            // Extract just the filename from the path
            const fileName = file.split('/').pop() || file;
            
            lines.push(`❌ ${fileName}`);
            
            for (const error of errors) {
                let errorLine = '   • ';
                
                // Add table ID if present
                if (error.tableId) {
                    errorLine += `[${error.tableId}] `;
                }
                
                // Add field if present
                if (error.field) {
                    errorLine += `${error.field}: `;
                }
                
                // Add the error message
                errorLine += error.message;
                
                lines.push(errorLine);
            }
            
            // Add blank line between files
            lines.push('');
        }

        return lines.join('\n').trim();
    }
}
