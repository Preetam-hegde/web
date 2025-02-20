document.addEventListener('DOMContentLoaded', () => {
    const bitCountInput = document.getElementById('bitCount');
    const executeBtn = document.getElementById('executeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const verilogCodeDisplay = document.getElementById('verilogCodeDisplay');

    const operationSelect1 = document.getElementById('operation1');
    const operationSelect2 = document.getElementById('operation2');
    const operationSelect3 = document.getElementById('operation3');

    const indexControls1 = document.querySelector('.index-controls-1');
    const indexControls2 = document.querySelector('.index-controls-2');
    const indexControls3 = document.querySelector('.index-controls-3');

    const indexInput1 = document.getElementById('index1');
    const indexInput2 = document.getElementById('index2');
    const indexInput3 = document.getElementById('index3');

    const endIndexControls1 = document.querySelector('.end-index-controls-1');
    const endIndexControls2 = document.querySelector('.end-index-controls-2');
    const endIndexControls3 = document.querySelector('.end-index-controls-3');

    const endIndexInput1 = document.getElementById('endIndex1');
    const endIndexInput2 = document.getElementById('endIndex2');
    const endIndexInput3 = document.getElementById('endIndex3');

    const replicateControls1 = document.querySelector('.replicate-controls-1');
    const replicateControls2 = document.querySelector('.replicate-controls-2');
    const replicateControls3 = document.querySelector('.replicate-controls-3');

    const replicateInput1 = document.getElementById('replicateCount1');
    const replicateInput2 = document.getElementById('replicateCount2');
    const replicateInput3 = document.getElementById('replicateCount3');


    const bitsContainerA = document.getElementById('bitsA');
    const bitsContainerB = document.getElementById('bitsB');
    const bitsContainerResult = document.getElementById('bitsResult');

    let bitCount = parseInt(bitCountInput.value);
    let vectorA = Array(bitCount).fill(0);
    let vectorB = Array(bitCount).fill(0);
    let resultVector = [];

    function createBits(container, vector, isInputVector) {
        container.innerHTML = '';
        vector.forEach((bitValue, index) => {
            const bitElement = document.createElement('div');
            bitElement.classList.add('bit');
            bitElement.classList.add(bitValue === 1 ? 'one' : 'zero');
            bitElement.textContent = bitValue;
            bitElement.dataset.index = index;

            if (isInputVector) {
                bitElement.addEventListener('click', () => {
                    const currentIndex = parseInt(bitElement.dataset.index);
                    vector[currentIndex] = 1 - vector[currentIndex];
                    updateBitDisplay(bitElement, vector[currentIndex]);
                    if (container === bitsContainerA) {
                        vectorA = vector;
                    } else if (container === bitsContainerB) {
                        vectorB = vector;
                    }
                });
            }
            container.appendChild(bitElement);
        });
    }

    function updateBitDisplay(bitElement, bitValue) {
        bitElement.textContent = bitValue;
        bitElement.classList.remove(bitValue === 0 ? 'one' : 'zero');
        bitElement.classList.add(bitValue === 1 ? 'one' : 'zero');
    }

    function updateVectorDisplay(container, vector) {
        container.innerHTML = '';
        createBits(container, vector, false);
    }

    function initializeVectors() {
        bitCount = parseInt(bitCountInput.value);
        vectorA = Array(bitCount).fill(0);
        vectorB = Array(bitCount).fill(0);
        resultVector = [];
        createBits(bitsContainerA, vectorA, true);
        createBits(bitsContainerB, vectorB, true);
        updateVectorDisplay(bitsContainerResult, resultVector);
        verilogCodeDisplay.textContent = "// Select operations and click 'Execute Operations'\n// Operations are applied sequentially: Result of Op1 becomes input for Op2, etc.";
    }

    function performOperations() {
        let currentVector = [...vectorA]; // Start with Vector A as working vector
        let verilogCode = "";
        let intermediateResultName = "vectorA"; // Start with vectorA as initial input

        for (let i = 1; i <= 3; i++) {
            const operationName = document.getElementById(`operation${i}`).value;
            if (operationName === 'none') continue;

            let index = document.getElementById(`index${i}`).value !== "" ? parseInt(document.getElementById(`index${i}`).value) : null;
            let endIndex = document.getElementById(`endIndex${i}`).value !== "" ? parseInt(document.getElementById(`endIndex${i}`).value) : null;
            let replicateCount = document.getElementById(`replicateCount${i}`).value !== "" ? parseInt(document.getElementById(`replicateCount${i}`).value) : null;


            let operationResult;
            let operationVerilog = "";
            let nextResultName = `intermediate_result_${i}`; // Name for result of this operation

            if (operationName === 'and') {
                if (currentVector.length !== vectorB.length) {
                    alert(`Operation ${i}: Vectors must be the same length for AND.`);
                    return;
                }
                operationResult = currentVector.map((bitA, j) => bitA & vectorB[j]);
                operationVerilog = `// Operation ${i}: AND\nwire [${currentVector.length-1}:0] ${nextResultName} = ${intermediateResultName} & vectorB;`;
            } else if (operationName === 'or') {
                if (currentVector.length !== vectorB.length) {
                    alert(`Operation ${i}: Vectors must be the same length for OR.`);
                    return;
                }
                operationResult = currentVector.map((bitA, j) => bitA | vectorB[j]);
                operationVerilog = `// Operation ${i}: OR\nwire [${currentVector.length-1}:0] ${nextResultName} = ${intermediateResultName} | vectorB;`;
            } else if (operationName === 'not') {
                operationResult = currentVector.map(bitA => 1 - bitA);
                operationVerilog = `// Operation ${i}: NOT\nwire [${currentVector.length-1}:0] ${nextResultName} = ~${intermediateResultName};`;
            } else if (operationName === 'concat') {
                operationResult = currentVector.concat(vectorB);
                operationVerilog = `// Operation ${i}: Concat\nwire [${currentVector.length + vectorB.length-1}:0] ${nextResultName} = {${intermediateResultName}, vectorB};`;
            } else if (operationName === 'slice') { // Slice Vector A
                if (index === null || endIndex === null || isNaN(index) || isNaN(endIndex)) {
                    alert(`Operation ${i}: Slice (Vector A) requires valid Start and End Indices.`);
                    return;
                }
                if (index < 0 || endIndex < 0 || index >= currentVector.length || endIndex >= currentVector.length || index > endIndex) {
                    alert(`Operation ${i}: Slice (Vector A) indices are invalid.`);
                    return;
                }
                operationResult = currentVector.slice(index, endIndex + 1);
                operationVerilog = `// Operation ${i}: Slice (Vector A)\nwire [${endIndex - index}:0] ${nextResultName} = ${intermediateResultName}[${endIndex}:${index}];`;
            } else if (operationName === 'slice_b') { // Slice Vector B
                if (index === null || endIndex === null || isNaN(index) || isNaN(endIndex)) {
                    alert(`Operation ${i}: Slice (Vector B) requires valid Start and End Indices.`);
                    return;
                }
                if (index < 0 || endIndex < 0 || index >= vectorB.length || endIndex >= vectorB.length || index > endIndex) {
                    alert(`Operation ${i}: Slice (Vector B) indices are invalid.`);
                    return;
                }
                operationResult = vectorB.slice(index, endIndex + 1);
                operationVerilog = `// Operation ${i}: Slice (Vector B)\nwire [${endIndex - index}:0] ${nextResultName} = vectorB[${endIndex}:${index}];`;
                 intermediateResultName = "vectorB"; // Input to next operation is now vectorB slice (important!)
            } else if (operationName === 'replicate') { // Replicate Vector A
                if (isNaN(replicateCount) || replicateCount <= 0) {
                    alert(`Operation ${i}: Replicate (Vector A) requires a valid Replicate Count.`);
                    return;
                }
                operationResult = [];
                for (let j = 0; j < replicateCount; j++) {
                    operationResult = operationResult.concat(currentVector);
                }
                operationVerilog = `// Operation ${i}: Replicate (Vector A)\nwire [${currentVector.length * replicateCount -1}:0] ${nextResultName} = {${replicateCount}{${intermediateResultName}}};`;
            } else if (operationName === 'replicate_b') { // Replicate Vector B
                if (isNaN(replicateCount) || replicateCount <= 0) {
                    alert(`Operation ${i}: Replicate (Vector B) requires a valid Replicate Count.`);
                    return;
                }
                operationResult = [];
                for (let j = 0; j < replicateCount; j++) {
                    operationResult = operationResult.concat(vectorB);
                }
                operationVerilog = `// Operation ${i}: Replicate (Vector B)\nwire [${vectorB.length * replicateCount -1}:0] ${nextResultName} = {${replicateCount}{vectorB}};`;
                intermediateResultName = "vectorB"; // Input to next operation is now vectorB replication (important!)
            }

             else {
                operationResult = [...currentVector];
                operationVerilog = `// Operation ${i}: None`;
                nextResultName = intermediateResultName; // No new result name if no operation
            }

            currentVector = operationResult; // Output of current op becomes input for next
            verilogCode += operationVerilog + "\n";
            if (operationName !== 'slice_b' && operationName !== 'replicate_b') { // Only update intermediateResultName if not slice_b or replicate_b
                intermediateResultName = nextResultName;
            } else if (i < 3 && document.getElementById(`operation${i+1}`).value !== 'none'){
                 intermediateResultName = nextResultName; // For next operation, input is result of slice_b or replicate_b if next op is not none
            }


        }

        resultVector = currentVector;
        updateVectorDisplay(bitsContainerResult, resultVector);
        verilogCodeDisplay.textContent = verilogCode;
    }


    initializeVectors();

    bitCountInput.addEventListener('change', initializeVectors);
    executeBtn.addEventListener('click', performOperations);
    clearBtn.addEventListener('click', () => {
        initializeVectors();
    });

    // Operation Select Event Listeners for each slot
    for (let i = 1; i <= 3; i++) {
        const operationSelect = document.getElementById(`operation${i}`);
        const indexControls = document.querySelector(`.index-controls-${i}`);
        const endIndexControls = document.querySelector(`.end-index-controls-${i}`);
        const replicateControls = document.querySelector(`.replicate-controls-${i}`);
        const indexLabel = indexControls.querySelector('.index-label');
        const indexInput = indexControls.querySelector('.index-input');


        operationSelect.addEventListener('change', () => {
            const selectedOperation = operationSelect.value;
            indexControls.style.display = 'none';
            endIndexControls.style.display = 'none';
            replicateControls.style.display = 'none';

            if (selectedOperation === 'slice' || selectedOperation === 'slice_b') {
                indexControls.style.display = 'flex';
                endIndexControls.style.display = 'flex';
                indexLabel.textContent = "Start Index (Slice):";
                indexInput.title = "For Slice, this is Start Index";
            } else if (selectedOperation === 'replicate' || selectedOperation === 'replicate_b') {
                replicateControls.style.display = 'flex';
                indexControls.style.display = 'none';
                endIndexControls.style.display = 'none';
            }
             else if (selectedOperation === 'not' || selectedOperation === 'concat' || selectedOperation === 'none') {
                indexControls.style.display = 'none';
                endIndexControls.style.display = 'none';
                replicateControls.style.display = 'none';
            }
            else {
                indexControls.style.display = 'flex';
                indexLabel.textContent = "Index (Op):";
                indexInput.title = "For Indexing Operations";
                endIndexControls.style.display = 'none';
                replicateControls.style.display = 'none';
            }
        });
    }


});