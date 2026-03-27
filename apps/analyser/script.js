class StopSignal extends Error {
  constructor() {
    super('STOP');
    this.name = 'StopSignal';
  }
}

class SortingVisualizer {
  constructor() {
    this.array = [];
    this.barElements = [];
    this.maxValue = 1;

    this.arrayContainer = document.getElementById('array-container');
    this.sizeInput = document.getElementById('size');
    this.speedInput = document.getElementById('speed');
    this.algorithmSelect = document.getElementById('algorithm');
    this.distributionSelect = document.getElementById('distribution');

    this.generateBtn = document.getElementById('generate');
    this.sortBtn = document.getElementById('sort');
    this.pauseBtn = document.getElementById('pause');
    this.stopBtn = document.getElementById('stop');

    this.definitionText = document.getElementById('definition-text');
    this.complexityText = document.getElementById('complexity-text');

    this.sizeValueSpan = document.getElementById('size-value');
    this.speedValueSpan = document.getElementById('speed-value');

    this.statusValue = document.getElementById('run-status');
    this.statAlgorithm = document.getElementById('stat-algorithm');
    this.statComparisons = document.getElementById('stat-comparisons');
    this.statSwaps = document.getElementById('stat-swaps');
    this.statSize = document.getElementById('stat-size');
    this.statTime = document.getElementById('stat-time');
    this.statDelay = document.getElementById('stat-delay');

    this.algorithmDefinitions = {
      bubble: {
        definition:
          "Bubble Sort is a simple comparison-based algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. Elements 'bubble' to their correct position.",
        complexity: 'Worst and Average Case: O(n²), Best Case: O(n)'
      },
      insertion: {
        definition:
          'Insertion Sort builds the final sorted array one item at a time. It is efficient for small datasets and nearly sorted data.',
        complexity: 'Worst and Average Case: O(n²), Best Case: O(n)'
      },
      selection: {
        definition:
          'Selection Sort repeatedly finds the minimum element from the unsorted part and places it at the beginning. Simple to implement but not efficient for large lists.',
        complexity: 'Worst, Average, and Best Case: O(n²)'
      },
      quick: {
        definition:
          "Quick Sort is a divide-and-conquer algorithm. It selects a 'pivot' and partitions the array around it, then recursively sorts subarrays. Very efficient on average.",
        complexity: 'Worst Case: O(n²), Average Case: O(n log n), Best Case: O(n log n)'
      },
      merge: {
        definition:
          'Merge Sort is a divide-and-conquer, efficient, stable sort. It divides the array into halves, sorts them recursively, and then merges the sorted halves.',
        complexity: 'Worst, Average, and Best Case: O(n log n)'
      }
    };

    this.isSorting = false;
    this.isPaused = false;
    this.shouldStop = false;
    this.stopSignal = new StopSignal();

    this.minDelay = 18;
    this.maxDelay = 420;

    this.comparisons = 0;
    this.swaps = 0;

    this.runStartTime = null;
    this.elapsedTimer = null;
    this.statusTimeout = null;

    this.initializeEventListeners();
    this.updateAlgorithmInfo(this.algorithmSelect.value);
    this.updateSizeLabel();
    this.updateSpeedLabel();
    this.statAlgorithm.textContent =
      this.algorithmSelect.options[this.algorithmSelect.selectedIndex].text;
    this.generateArray();
  }

  initializeEventListeners() {
    this.generateBtn.addEventListener('click', () => {
      if (this.isSorting) {
        this.flashStatus('Stop the current run before reshuffling');
        return;
      }
      this.generateArray();
    });

    this.sortBtn.addEventListener('click', () => this.startSort());
    this.pauseBtn.addEventListener('click', () => this.togglePause());
    this.stopBtn.addEventListener('click', () => this.stopSort());

    this.sizeInput.addEventListener('input', () => {
      this.updateSizeLabel();
      if (this.isSorting) {
        this.flashStatus('Finish the sort to resize the array');
        return;
      }
      this.generateArray();
    });

    this.speedInput.addEventListener('input', () => this.updateSpeedLabel());

    this.algorithmSelect.addEventListener('change', (event) => {
      this.updateAlgorithmInfo(event.target.value);
      this.statAlgorithm.textContent =
        this.algorithmSelect.options[this.algorithmSelect.selectedIndex].text;
      if (!this.isSorting) {
        this.updateStatus('Ready', 'idle');
      }
    });

    this.distributionSelect.addEventListener('change', () => {
      if (this.isSorting) {
        this.flashStatus('Pattern changes apply after the current run');
        return;
      }
      this.generateArray();
    });

    window.addEventListener('resize', () => this.updateAllBarHeights());
  }

  updateAlgorithmInfo(algorithmName) {
    const info = this.algorithmDefinitions[algorithmName];
    if (info) {
      this.definitionText.textContent = info.definition;
      this.complexityText.textContent = `Time Complexity: ${info.complexity}`;
    } else {
      this.definitionText.textContent =
        'Select an algorithm from the dropdown to view its definition.';
      this.complexityText.textContent =
        'Time complexity will be displayed here after algorithm selection.';
    }
  }

  generateArray() {
    this.array = this.buildArray(this.distributionSelect.value, Number(this.sizeInput.value));
    this.maxValue = Math.max(...this.array) || 1;
    this.renderBars();
    this.clearAllHighlights(true);
    this.resetMetrics();
    this.updateStatus('Ready', 'idle');
    this.pauseBtn.disabled = true;
    this.stopBtn.disabled = true;
    this.pauseBtn.textContent = 'Pause';
    this.isPaused = false;
    this.shouldStop = false;
  }

  buildArray(pattern, size) {
    const baseAscending = Array.from({ length: size }, (_, index) =>
      Math.round(((index + 1) / size) * 100)
    );

    switch (pattern) {
      case 'nearly-sorted': {
        const arr = [...baseAscending];
        const swaps = Math.max(1, Math.floor(size * 0.08));
        for (let i = 0; i < swaps; i += 1) {
          const idxA = this.randomInt(0, size - 1);
          const idxB = this.randomInt(0, size - 1);
          [arr[idxA], arr[idxB]] = [arr[idxB], arr[idxA]];
        }
        return arr;
      }
      case 'reversed':
        return [...baseAscending].reverse();
      case 'few-unique': {
        const uniqueCount = Math.max(3, Math.floor(size / 6));
        const palette = Array.from({ length: uniqueCount }, () => this.randomInt(12, 100));
        return Array.from({ length: size }, () => {
          const paletteIndex = this.randomInt(0, uniqueCount - 1);
          return palette[paletteIndex];
        });
      }
      case 'random':
      default:
        return Array.from({ length: size }, () => this.randomInt(12, 100));
    }
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  renderBars() {
    this.arrayContainer.innerHTML = '';
    this.barElements = [];
    this.maxValue = Math.max(...this.array) || 1;

    this.array.forEach((value) => {
      const bar = document.createElement('div');
      bar.className = 'array-bar';
      bar.style.height = this.calculateHeight(value);
      bar.dataset.value = Math.round(value);
      this.arrayContainer.appendChild(bar);
      this.barElements.push(bar);
    });
    this.updateAllBarHeights();
  }

  calculateHeight(value) {
    const percent = (value / this.maxValue) * 100;
    return `${Math.max(percent, 4)}%`;
  }

  updateBarHeight(index) {
    const bar = this.barElements[index];
    if (!bar) return;
    const value = this.array[index];
    bar.style.height = this.calculateHeight(value);
    bar.dataset.value = Math.round(value);
  }

  updateAllBarHeights() {
    this.maxValue = Math.max(...this.array) || 1;
    this.array.forEach((_, index) => this.updateBarHeight(index));
  }

  clearAllHighlights(includeSorted = false) {
    const classesToRemove = ['comparing', 'pivot', 'swapping'];
    if (includeSorted) {
      classesToRemove.push('sorted');
    }
    this.barElements.forEach((bar) => {
      classesToRemove.forEach((cls) => bar.classList.remove(cls));
    });
  }

  resetMetrics(preserveStatus = false) {
    this.comparisons = 0;
    this.swaps = 0;
    this.updateStats();
    this.stopTimer();
    this.statTime.textContent = '00:00';
    if (!preserveStatus) {
      this.updateStatus('Ready', 'idle');
    }
  }

  updateStats() {
    this.statComparisons.textContent = this.comparisons.toString();
    this.statSwaps.textContent = this.swaps.toString();
    this.statSize.textContent = this.array.length.toString();
    this.statDelay.textContent = `${this.getStepDelay()} ms`;
  }

  updateStatus(text, state = 'idle') {
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
      this.statusTimeout = null;
    }
    this.statusValue.textContent = text;
    this.statusValue.dataset.state = state;
  }

  flashStatus(message, duration = 1400) {
    const previousText = this.statusValue.textContent;
    const previousState = this.statusValue.dataset.state;
    this.statusValue.textContent = message;
    this.statusValue.dataset.state = 'stopped';
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
    }
    this.statusTimeout = setTimeout(() => {
      this.statusValue.textContent = previousText;
      this.statusValue.dataset.state = previousState;
      this.statusTimeout = null;
    }, duration);
  }

  updateSizeLabel() {
    const size = this.sizeInput.value;
    this.sizeValueSpan.textContent = size;
    this.statSize.textContent = size;
  }

  updateSpeedLabel() {
    const delay = this.getStepDelay();
    let descriptor = 'Turbo';
    if (delay > 300) descriptor = 'Slow';
    else if (delay > 200) descriptor = 'Medium';
    else if (delay > 120) descriptor = 'Fast';
    else if (delay > 60) descriptor = 'Very Fast';
    this.speedValueSpan.textContent = descriptor;
    this.statDelay.textContent = `${delay} ms`;
  }

  getStepDelay() {
    const sliderValue = Number(this.speedInput.value);
    const inverse = 100 - sliderValue;
    const delayRange = this.maxDelay - this.minDelay;
    return Math.round(this.minDelay + (delayRange * inverse) / 100);
  }

  startTimer() {
    this.stopTimer();
    this.runStartTime = performance.now();
    this.statTime.textContent = '00:00';
    this.elapsedTimer = setInterval(() => {
      if (!this.isSorting || !this.runStartTime) return;
      const elapsedSeconds = Math.floor((performance.now() - this.runStartTime) / 1000);
      this.statTime.textContent = this.formatElapsed(elapsedSeconds);
    }, 200);
  }

  stopTimer(finalize = false) {
    if (this.elapsedTimer) {
      clearInterval(this.elapsedTimer);
      this.elapsedTimer = null;
    }
    if (finalize && this.runStartTime) {
      const elapsedSeconds = Math.floor((performance.now() - this.runStartTime) / 1000);
      this.statTime.textContent = this.formatElapsed(elapsedSeconds);
    } else if (!this.isSorting) {
      this.statTime.textContent = '00:00';
    }
    this.runStartTime = null;
  }

  formatElapsed(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  async startSort() {
    if (this.isSorting) return;
    if (this.array.length === 0) {
      this.flashStatus('Generate an array first');
      return;
    }

    this.resetMetrics(true);
    this.isSorting = true;
    this.shouldStop = false;
    this.isPaused = false;
    this.pauseBtn.disabled = false;
    this.stopBtn.disabled = false;
    this.pauseBtn.textContent = 'Pause';
    this.setControlsDisabled(true);
    this.clearAllHighlights(true);
    this.updateStatus('Sorting…', 'sorting');
    this.statAlgorithm.textContent =
      this.algorithmSelect.options[this.algorithmSelect.selectedIndex].text;
    this.startTimer();

    let aborted = false;

    try {
      await this.runSelectedAlgorithm();
      if (!this.shouldStop) {
        this.finalizeSort();
        this.updateStatus('Sorted!', 'done');
      }
    } catch (error) {
      if (error === this.stopSignal) {
        aborted = true;
        this.updateStatus('Stopped', 'stopped');
      } else {
        aborted = true;
        console.error('Sorting error:', error);
        this.updateStatus('Error — check console', 'stopped');
      }
    } finally {
      this.isSorting = false;
      this.isPaused = false;
      this.pauseBtn.disabled = true;
      this.stopBtn.disabled = true;
      this.pauseBtn.textContent = 'Pause';
      this.setControlsDisabled(false);
      const wasStopped = aborted || this.shouldStop;
      this.stopTimer(!wasStopped);
      if (wasStopped) {
        this.clearAllHighlights(true);
      }
      this.shouldStop = false;
      this.updateStats();
    }
  }

  async runSelectedAlgorithm() {
    switch (this.algorithmSelect.value) {
      case 'bubble':
        await this.bubbleSort();
        break;
      case 'insertion':
        await this.insertionSort();
        break;
      case 'selection':
        await this.selectionSort();
        break;
      case 'quick':
        await this.quickSort(0, this.array.length - 1);
        break;
      case 'merge':
        await this.mergeSort(0, this.array.length - 1);
        break;
      default:
        break;
    }
  }

  setControlsDisabled(disabled) {
    this.generateBtn.disabled = disabled;
    this.sortBtn.disabled = disabled;
    this.algorithmSelect.disabled = disabled;
    this.sizeInput.disabled = disabled;
    this.distributionSelect.disabled = disabled;
  }

  togglePause() {
    if (!this.isSorting) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.pauseBtn.textContent = 'Resume';
      this.updateStatus('Paused', 'paused');
    } else {
      this.pauseBtn.textContent = 'Pause';
      this.updateStatus('Sorting…', 'sorting');
    }
  }

  stopSort() {
    if (!this.isSorting) return;
    this.shouldStop = true;
    this.isPaused = false;
    this.pauseBtn.textContent = 'Pause';
    this.updateStatus('Stopping…', 'stopped');
  }

  async waitWhilePaused() {
    while (this.isPaused && !this.shouldStop) {
      await this.sleep(60);
    }
    if (this.shouldStop) {
      throw this.stopSignal;
    }
  }

  async tick(multiplier = 1) {
    await this.waitWhilePaused();
    if (this.shouldStop) {
      throw this.stopSignal;
    }
    const delay = Math.max(0, Math.round(this.getStepDelay() * multiplier));
    if (delay > 0) {
      await this.sleep(delay);
    } else {
      await this.sleep(0);
    }
    if (this.shouldStop) {
      throw this.stopSignal;
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  highlight(indices, className) {
    indices.forEach((index) => {
      const bar = this.barElements[index];
      if (bar) {
        bar.classList.add(className);
      }
    });
  }

  clearHighlights(indices, classes = ['comparing']) {
    indices.forEach((index) => {
      const bar = this.barElements[index];
      if (bar) {
        classes.forEach((cls) => bar.classList.remove(cls));
      }
    });
  }

  highlightComparison(indices) {
    this.highlight(indices, 'comparing');
  }

  highlightPivot(index) {
    this.highlight([index], 'pivot');
  }

  clearPivot(index) {
    this.clearHighlights([index], ['pivot']);
  }

  async swap(i, j) {
    if (i === j) return;
    this.highlight([i, j], 'swapping');
    await this.tick();
    const temp = this.array[i];
    this.array[i] = this.array[j];
    this.array[j] = temp;
    this.updateBarHeight(i);
    this.updateBarHeight(j);
    this.incrementSwaps();
    this.clearHighlights([i, j], ['swapping']);
  }

  async bubbleSort() {
    const n = this.array.length;
    for (let i = 0; i < n; i += 1) {
      for (let j = 0; j < n - i - 1; j += 1) {
        this.highlightComparison([j, j + 1]);
        this.incrementComparisons();
        await this.tick();
        if (this.array[j] > this.array[j + 1]) {
          await this.swap(j, j + 1);
        }
        this.clearHighlights([j, j + 1], ['comparing']);
      }
      const sortedBar = this.barElements[n - i - 1];
      if (sortedBar) sortedBar.classList.add('sorted');
      await this.tick(0.5);
    }
  }

  async insertionSort() {
    const bars = this.barElements;
    for (let i = 1; i < this.array.length; i += 1) {
      const key = this.array[i];
      let j = i - 1;
      this.highlightPivot(i);
      await this.tick(0.7);

      while (j >= 0) {
        this.highlightComparison([j, j + 1]);
        this.incrementComparisons();
        await this.tick(0.7);

        if (this.array[j] > key) {
          this.array[j + 1] = this.array[j];
          this.updateBarHeight(j + 1);
          bars[j + 1].classList.add('swapping');
          await this.tick(0.6);
          bars[j + 1].classList.remove('swapping');
          this.clearHighlights([j + 1], ['comparing']);
          j -= 1;
        } else {
          this.clearHighlights([j, j + 1], ['comparing']);
          break;
        }
      }

      this.array[j + 1] = key;
      this.updateBarHeight(j + 1);
      await this.tick(0.6);
      this.clearHighlights([j + 1], ['comparing', 'swapping']);
      this.clearPivot(i);
    }
  }

  async selectionSort() {
    const n = this.array.length;
    for (let i = 0; i < n - 1; i += 1) {
      let minIndex = i;
      this.highlightPivot(minIndex);
      for (let j = i + 1; j < n; j += 1) {
        this.highlightComparison([j, minIndex]);
        this.incrementComparisons();
        await this.tick(0.7);
        if (this.array[j] < this.array[minIndex]) {
          this.clearPivot(minIndex);
          minIndex = j;
          this.highlightPivot(minIndex);
        }
        this.clearHighlights([j], ['comparing']);
      }
      this.clearHighlights([minIndex], ['comparing']);
      if (minIndex !== i) {
        await this.swap(i, minIndex);
      }
      const bar = this.barElements[i];
      if (bar) bar.classList.add('sorted');
      this.clearPivot(minIndex);
      await this.tick(0.4);
    }
  }

  async quickSort(low, high) {
    if (low >= high) {
      if (low >= 0 && low < this.barElements.length) {
        this.barElements[low].classList.add('sorted');
      }
      return;
    }
    const pivotIndex = await this.partition(low, high);
    if (pivotIndex >= 0 && pivotIndex < this.barElements.length) {
      this.barElements[pivotIndex].classList.add('sorted');
    }
    await this.quickSort(low, pivotIndex - 1);
    await this.quickSort(pivotIndex + 1, high);
  }

  async partition(low, high) {
    const pivotValue = this.array[high];
    this.highlightPivot(high);
    let i = low - 1;

    for (let j = low; j < high; j += 1) {
      this.highlightComparison([j, high]);
      this.incrementComparisons();
      await this.tick(0.7);
      if (this.array[j] <= pivotValue) {
        i += 1;
        if (i !== j) {
          await this.swap(i, j);
        }
      }
      this.clearHighlights([j], ['comparing']);
    }
    this.clearPivot(high);
    if (i + 1 !== high) {
      await this.swap(i + 1, high);
    }
    return i + 1;
  }

  async mergeSort(left, right) {
    if (left >= right) return;
    const mid = left + Math.floor((right - left) / 2);
    await this.mergeSort(left, mid);
    await this.mergeSort(mid + 1, right);
    await this.merge(left, mid, right);
  }

  async merge(left, mid, right) {
    const leftArr = this.array.slice(left, mid + 1);
    const rightArr = this.array.slice(mid + 1, right + 1);

    let i = 0;
    let j = 0;
    let k = left;

    while (i < leftArr.length && j < rightArr.length) {
      this.highlightComparison([k]);
      this.incrementComparisons();
      if (leftArr[i] <= rightArr[j]) {
        this.array[k] = leftArr[i];
        i += 1;
      } else {
        this.array[k] = rightArr[j];
        j += 1;
      }
      this.updateBarHeight(k);
      this.highlight([k], 'swapping');
      await this.tick(0.6);
      this.clearHighlights([k], ['comparing', 'swapping']);
      k += 1;
    }

    while (i < leftArr.length) {
      this.array[k] = leftArr[i];
      i += 1;
      this.updateBarHeight(k);
      this.highlight([k], 'swapping');
      await this.tick(0.5);
      this.clearHighlights([k], ['swapping']);
      k += 1;
    }

    while (j < rightArr.length) {
      this.array[k] = rightArr[j];
      j += 1;
      this.updateBarHeight(k);
      this.highlight([k], 'swapping');
      await this.tick(0.5);
      this.clearHighlights([k], ['swapping']);
      k += 1;
    }
  }

  finalizeSort() {
    this.barElements.forEach((bar) => {
      bar.classList.remove('comparing', 'pivot', 'swapping');
      bar.classList.add('sorted');
    });
  }

  incrementComparisons(count = 1) {
    this.comparisons += count;
    this.statComparisons.textContent = this.comparisons.toString();
  }

  incrementSwaps(count = 1) {
    this.swaps += count;
    this.statSwaps.textContent = this.swaps.toString();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.sortingVisualizer = new SortingVisualizer();
});
