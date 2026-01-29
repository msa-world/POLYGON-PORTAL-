// Clear Shapes Storage Utility
// Run this in browser console to clear all saved shapes

export function clearAllShapes() {
    if (typeof window !== 'undefined') {
        // Clear the shapes storage
        localStorage.removeItem('ict-drawn-shapes')
        console.log('✅ All drawn shapes cleared from storage')

        // Reload the page to reflect changes
        window.location.reload()
    }
}

// To use: Open browser console and run:
// clearAllShapes()
