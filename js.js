/**
 * @param {boolean} withFirstValue
 * @returns {HTMLDivElement} Added key element
 */
function addNewKey(withFirstValue = true) {
    let div = document.createElement("div");
    // let randomHash = generateRandomHash();
    div.innerHTML = `                <div class="form-floating mb-3">
    <input type="text" class="form-control wpp-key">
    <label>Key</label>
</div>
<div class="row wpp-values">
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <div class="form-floating mb-3">
            <input type="text" class="form-control wpp-value">
            <label>Value</label>
        </div>
    </div>
</div>
<hr>`;
    if (!withFirstValue) {
        div.querySelector(".wpp-values").innerHTML = "";
    }
    document.querySelector(".wpp-keys").appendChild(div);
    return div;
}

/**
 * Makes sure that all inputs have the correct events
 */
function updateEvents() {
    let inputs = document.querySelectorAll(".wpp-value, .wpp-key");
    for (const input of inputs) {
        input.addEventListener("keyup", refreshElements);
    }
}

/**
 * Detects if there are any empty keys and adds a new one if there are none
 */
function addNewKeyIfNoEmpty() {
    let keys = document.querySelectorAll(".wpp-key");
    let anyEmpty = false;
    for (const key of keys) {
        if (key.value == "") {
            anyEmpty = true;
            break;
        }
    }
    if (anyEmpty == false) {
        addNewKey();
    }
}

/**
 * Detects if there are any empty values and adds a new one if there are none
 */
function addNewValuesFieldsIfNoEmpty() {
    let keys = document.querySelectorAll(".wpp-keys > div");

    for (const key of keys) {
        let inputs = key.querySelectorAll(".wpp-values input");
        let anyEmpty = false;
        for (const input of inputs) {
            if (input.value == "") {
                anyEmpty = true;
                break;
            }
        }
        if (anyEmpty == false) {
            addNewValue(key);
        }
    }
}

/**
 * Remove Key Fields is there are more than one empty
 */
function removeKeyFieldsIfEmpty() {
    let keys = document.querySelectorAll(".wpp-keys > div");

    let emptyKeys = [];
    let numberOfEmptyKeys = 0;

    // Get empty keys
    for (const key of keys) {
        let inputs = key.querySelectorAll(".wpp-values input");

        // Delete if key is empty and all values are empty
        let shouldBeDeleted = true;

        if (key.querySelector(".wpp-key").value != "") {
            shouldBeDeleted = false;
        }

        for (const input of inputs) {
            if (input.value != "") {
                shouldBeDeleted = false;
                break;
            }
        }
        if (shouldBeDeleted == true) {
            emptyKeys.push(key);
            numberOfEmptyKeys += 1;
        }
    }

    if (numberOfEmptyKeys >= 2) {
        for (let i = 0; i < emptyKeys.length - 1; i++) {
            emptyKeys[i].remove();
        }
    }
}

/**
 * Remove Value Fields is there are more than one
 */
function removeValueFieldsIfEmpty() {
    let keys = document.querySelectorAll(".wpp-keys > div");

    for (const key of keys) {
        let values = key.querySelectorAll(".wpp-values > div");
        let numberOfEmptyValues = 0;
        let emptyValues = [];
        for (const value of values) {
            if (value.querySelector("input").value == "") {
                numberOfEmptyValues += 1;
                emptyValues.push(value);
            }
        }
        if (numberOfEmptyValues > 1) {
            for (let i = 0; i < emptyValues.length - 1; i++) {
                emptyValues[i].remove();
            }
        }
    }
}

/**
 * Handle all additional inputs
 */
function refreshElements() {
    addNewKeyIfNoEmpty();

    addNewValuesFieldsIfNoEmpty();

    removeValueFieldsIfEmpty();

    removeKeyFieldsIfEmpty();

    updateEvents();
}

function addNewValue(keyElement) {
    let div = document.createElement("div");
    div.classList.add(..."col-12 col-sm-6 col-lg-4 col-xl-3".split(" "));
    div.innerHTML = `<div class="form-floating mb-3">
        <input type="text" class="form-control wpp-value">
        <label>Value</label>
    </div>`;
    keyElement.querySelector(".wpp-values").appendChild(div);
    return div;
}

/**
 *
 */
function generateWpp() {
    let keyDivs = document.querySelectorAll(".wpp-keys > div");

    let data = [];
    for (const keyDiv of keyDivs) {
        let rawData = [];
        const keyValue = keyDiv.querySelector(".wpp-key").value;
        if (keyValue == "") {
            continue;
        }
        const valueDivs = keyDiv.querySelectorAll(".wpp-value");
        for (const valueDiv of valueDivs) {
            if (valueDiv.value != "") {
                rawData.push(valueDiv.value);
            }
        }

        if (rawData.length != 0) {
            data.push({
                key: keyValue,
                values: rawData,
            });
        }
    }

    if (data.length == 0) {
        alert("No data to generate W++ from");
        return;
    }

    let output = "{\n";
    for (const pair of data) {
        let rawValues = [];
        for (const value of pair.values) {
            rawValues.push(`"${value}"`);
        }
        output += `${pair.key}(${rawValues.join(" + ")})\n`;
    }
    output += `}`;

    document.querySelector("#wpp-data").value = output;
}

function parseWpp() {
    let input = document.querySelector("#wpp-data").value;
    input = input.trim();

    if (input.length == 0) {
        console.error("Empty W++ content");
        return;
    }

    const oneLineFormat = false;

    /**
     * Detect borders of the W++ data
     */
    const start = input.indexOf("{");
    const end = input.lastIndexOf("}");

    input = input.substring(start + 1, end).trim();

    let splitted =
        oneLineFormat === false ? input.split("\n") : input.split(",");

    let data = [];

    for (const el of splitted) {
        let trimmedEl = el.trim();

        let valuesStartIndex = trimmedEl.indexOf("(");
        let valuesEndIndex = trimmedEl.lastIndexOf(")");
        let key = trimmedEl.substring(0, valuesStartIndex);
        let valuesRaw = trimmedEl.substring(
            valuesStartIndex + 1,
            valuesEndIndex
        );
        let values = [];
        let currentIndex = 0;
        while (currentIndex < valuesRaw.length) {
            let quoteStart = valuesRaw.substring(currentIndex).indexOf('"');
            let quoteEnd = valuesRaw
                .substring(currentIndex + quoteStart + 1)
                .indexOf('"');

            if (quoteStart < 0 || quoteEnd < 0) {
                console.error("Error");
                return;
            }

            values.push(
                valuesRaw.substring(
                    quoteStart + currentIndex + 1,
                    quoteEnd + quoteStart + currentIndex + 1
                )
            );
            let nextCurrentIndex = quoteStart + quoteEnd + currentIndex + 2;
            if (currentIndex >= nextCurrentIndex) {
                console.error("Infinite Loop");
                return;
            }
            currentIndex = nextCurrentIndex;
        }
        data.push({
            key: key,
            values: values,
        });
    }

    if (data.length == 0) {
        console.error("Missing data");
    }

    // Clear all existing keys
    document.querySelector(".wpp-keys").innerHTML = "";

    for (const pair of data) {
        let attr = addNewKey(false);
        attr.querySelector(".wpp-key").value = pair.key;
        for (const value of pair.values) {
            let val = addNewValue(attr);
            val.querySelector(".wpp-value").value = value;
        }
    }

    refreshElements();
}

// Add event listeners
document.querySelector("#wpp-generate").addEventListener("click", generateWpp);
document.querySelector("#wpp-parse").addEventListener("click", parseWpp);

// Add new empty key with empty values at the beginning
addNewKey();
// Make sure all elements are up to date
refreshElements();
