const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'components/map/edit-tools-context.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove duplicate undoPolygonPoint / redoPolygonPoint (The first occurrence)
// We look for the chunk starting at lines ~252
const undoStart = content.indexOf('const undoPolygonPoint = useCallback(() => {');
if (undoStart !== -1) {
    // Check if there's a second one
    const secondUndo = content.indexOf('const undoPolygonPoint = useCallback(() => {', undoStart + 1);
    if (secondUndo !== -1) {
        // We have duplicates. Remove the first one block.
        // We assume the block ends at the start of 'startDrawingPolygon' (line ~287)
        // Or we can find the end brace.

        // Let's find "const redoPolygonPoint" which follows undo
        const redoStart = content.indexOf('const redoPolygonPoint = useCallback(() => {', undoStart);

        if (redoStart !== -1) {
            // Find end of redo block.
            // It ends before "// --- DRAWING LOGIC ---" or "const startDrawingPolygon"
            const drawStart = content.indexOf('const startDrawingPolygon', redoStart);

            if (drawStart !== -1) {
                // Remove content from undoStart to drawStart (keeping comments maybe?)
                // Actually, verify it removes lines ~252 to 286
                // We will replace with empty string

                // Look for previous line end or just zap it
                // Check if `// --- DRAWING LOGIC ---` is there
                const drawingLogicComment = content.indexOf('// --- DRAWING LOGIC ---', redoStart);
                const cutEnd = (drawingLogicComment !== -1 && drawingLogicComment < drawStart) ? drawingLogicComment : drawStart;

                const toRemove = content.substring(undoStart, cutEnd);
                content = content.replace(toRemove, '');
                console.log('Removed duplicate undo/redo logic (chunk 1)');
            }
        }
    }
}

// 2. Fix toggleShapeVisibility (Set logic)
// Find the function definition
const toggleStart = content.indexOf('const toggleShapeVisibility = useCallback((id: string) => {');
if (toggleStart !== -1) {
    const nextFunction = content.indexOf('const saveShapes', toggleStart); // Assuming saveShapes follows
    if (nextFunction !== -1) {
        const toggleBlock = content.substring(toggleStart, nextFunction);

        const correctToggle = `const toggleShapeVisibility = useCallback((id: string) => {
        const map = getMap()
        const layer = shapeLayersRef.current.get(id)
        if (layer && map) {
            if (hiddenShapes.has(id)) {
                map.addLayer(layer)
                setHiddenShapes(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(id)
                    return newSet
                })
            } else {
                map.removeLayer(layer)
                setHiddenShapes(prev => {
                    const newSet = new Set(prev)
                    newSet.add(id)
                    return newSet
                })
            }
        }
    }, [getMap, hiddenShapes])

    `;
        content = content.replace(toggleBlock, correctToggle);
        console.log('Fixed toggleShapeVisibility logic');
    }
}

// 3. Remove duplicate selectedPolygon
const selectedVar = 'const selectedPolygon = selectedShape // Alias';
if (content.includes(selectedVar)) {
    content = content.replace(selectedVar, '');
    console.log('Removed duplicate selectedPolygon alias');
}

// 4. Inject setActiveEditTool
if (!content.includes('const setActiveEditTool = useCallback((tool: string | null) => {')) {
    const saveEdited = 'const saveEditedPolygon = useCallback(() => {';
    const injection = `
    const setActiveEditTool = useCallback((tool: string | null) => {
        if (cleanupFunctionRef.current) {
            cleanupFunctionRef.current()
            cleanupFunctionRef.current = null
        }

        setActiveEditToolState(tool)

        if (tool === "polygon") {
             startDrawingPolygon()
        }
        else if (tool === "circle") {
             startDrawingCircle()
        }
    }, [startDrawingPolygon, startDrawingCircle])

    `;

    if (content.includes(saveEdited)) {
        content = content.replace(saveEdited, injection + saveEdited);
        console.log('Injected setActiveEditTool');
    } else {
        console.error('Could not find saveEditedPolygon entry point');
    }
}

fs.writeFileSync(filePath, content);
console.log('Successfully patched edit-tools-context.tsx');
