// Function to validate input
function validateInput(pageReferenceInput) {
    const pages = pageReferenceInput.split(',');
    for (const page of pages) {
        if (isNaN(page) || page.trim() === '' || Number(page) < 0) {
            return false; // Invalid input
        }
    }
    return true; // Valid input
}

// FIFO Algorithm
function simulateFIFO(pageReferences, pageFrames) {
    let frames = [];
    let pageFaults = 0;
    const result = [];

    let tableHTML = "<thead><tr>";
    pageReferences.forEach(page => {
        tableHTML += `<th>${page}</th>`;
    });
    tableHTML += "</tr></thead><tbody><tr>";

    pageReferences.forEach((page) => {
        let pageFault = false;
        if (!frames.includes(page)) {
            pageFaults++;
            pageFault = true;
            if (frames.length < pageFrames) {
                frames.push(page);
            } else {
                frames.shift(); // FIFO removes the first frame added
                frames.push(page);
            }
        }

        tableHTML += "<td><div class='page-frame-column'>";
        frames.slice().reverse().forEach(frame => {
            tableHTML += `<div>${frame}</div>`;
        });
        tableHTML += "</div></td>";

        result.push(pageFault ? "Miss" : "Hit");
    });

    tableHTML += "</tr></tbody>";
    document.getElementById('simulation-table').innerHTML = tableHTML;

    return { result, pageFaults };
}

// LRU Algorithm
function simulateLRU(pageReferences, pageFrames) {
    let frames = [];
    let recentUsage = [];
    let pageFaults = 0;
    const result = [];

    let tableHTML = "<thead><tr>";
    pageReferences.forEach(page => {
        tableHTML += `<th>${page}</th>`;
    });
    tableHTML += "</tr></thead><tbody><tr>";

    pageReferences.forEach((page) => {
        let pageFault = false;
        if (!frames.includes(page)) {
            pageFaults++;
            pageFault = true;

            if (frames.length < pageFrames) {
                frames.push(page);
            } else {
                // Replace the least recently used page
                const leastRecentlyUsed = recentUsage.shift();
                const index = frames.indexOf(leastRecentlyUsed);
                frames[index] = page;
            }
        } else {
            // Move page to the end of recentUsage
            const index = recentUsage.indexOf(page);
            recentUsage.splice(index, 1);
        }

        recentUsage.push(page); // Always push the page to the recent usage

        tableHTML += "<td><div class='page-frame-column'>";
        frames.slice().reverse().forEach(frame => {
            tableHTML += `<div>${frame}</div>`;
        });
        tableHTML += "</div></td>";

        result.push(pageFault ? "Miss" : "Hit");
    });

    tableHTML += "</tr></tbody>";
    document.getElementById('simulation-table').innerHTML = tableHTML;

    return { result, pageFaults };
}

// Optimal Algorithm
function simulateOptimal(pageReferences, pageFrames) {
    let frames = [];
    let pageFaults = 0;
    const result = [];

    let tableHTML = "<thead><tr>";
    pageReferences.forEach(page => {
        tableHTML += `<th>${page}</th>`;
    });
    tableHTML += "</tr></thead><tbody><tr>";

    pageReferences.forEach((page, step) => {
        let pageFault = false;
        if (!frames.includes(page)) {
            pageFaults++;
            pageFault = true;

            if (frames.length < pageFrames) {
                frames.push(page);
            } else {
                // Optimal replacement: find the frame not used for the longest future time
                let furthestUse = -1;
                let replaceIndex = -1;
                frames.forEach((frame, index) => {
                    let nextUse = pageReferences.slice(step + 1).indexOf(frame);
                    if (nextUse === -1) {
                        replaceIndex = index; // If not found, consider it for replacement
                        return;
                    } else if (nextUse > furthestUse) {
                        furthestUse = nextUse;
                        replaceIndex = index;
                    }
                });
                frames[replaceIndex] = page;
            }
        }

        tableHTML += "<td><div class='page-frame-column'>";
        frames.slice().reverse().forEach(frame => {
            tableHTML += `<div>${frame}</div>`;
        });
        tableHTML += "</div></td>";

        result.push(pageFault ? "Miss" : "Hit");
    });

    tableHTML += "</tr></tbody>";
    document.getElementById('simulation-table').innerHTML = tableHTML;

    return { result, pageFaults };
}

function simulate() {
    // Get user inputs
    const pageReferenceInput = document.getElementById('page-ref').value;
    const pageFrames = parseInt(document.getElementById('frames').value);
    const algorithm = document.getElementById('algorithm').value;

    // Validate the page reference input
    if (!validateInput(pageReferenceInput)) {
        alert("Please enter valid positive page references separated by commas.");
        return;
    }

    // Convert the page reference input into an array of integers
    const pageReferences = pageReferenceInput.split(',').map(Number);

    let result, pageFaults;

    // Choose the algorithm
    if (algorithm === 'FIFO') {
        ({ result, pageFaults } = simulateFIFO(pageReferences, pageFrames));
    } else if (algorithm === 'LRU') {
        ({ result, pageFaults } = simulateLRU(pageReferences, pageFrames));
    } else if (algorithm === 'OPTIMAL') {
        ({ result, pageFaults } = simulateOptimal(pageReferences, pageFrames));
    }

    // Calculate total hits and misses
    const totalHits = result.filter(res => res === "Hit").length;
    const totalMisses = pageFaults; // Total misses equal to page faults

    // Display hits and misses
    let missHitHTML = "";
    result.forEach(res => {
        missHitHTML += `<span class='page-fault-${res === "Miss" ? "yes" : "no"}'>${res}</span> `;
    });

    document.getElementById("miss-hit-row").innerHTML = missHitHTML;
    document.getElementById("total-page-fault").innerHTML = `Total Page Faults = ${pageFaults}`;
    document.getElementById("total-hits").innerHTML = `Total Hits = ${totalHits}`; // Display total hits
    document.getElementById("total-misses").innerHTML = `Total Misses = ${totalMisses}`; // Display total misses

    // Calculate and display hit rate and miss rate
    const hitRate = ((totalHits / pageReferences.length) * 100).toFixed(2);
    const missRate = ((totalMisses / pageReferences.length) * 100).toFixed(2);
    document.getElementById("hit-miss-rate").innerHTML = `Hit Rate: ${hitRate}% | Miss Rate: ${missRate}%`;

    // Update the page reference display
    document.getElementById('page-reference').innerHTML = `Page reference: ${pageReferences.join(',')}`;
}
