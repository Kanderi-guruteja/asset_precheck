import fetch from 'node-fetch';

function call(url, nodeid = "") {
    try {
        console.log(url.replace('{}', nodeid));
        const selected_proxy = Object.values(proxies)[Math.floor(Math.random() * Object.values(proxies).length)];
        const command = `Invoke-WebRequest -Uri '${url.replace('{}', nodeid)}'`;
        const result = require('child_process').execSync(`powershell -Command "${command}"`, { encoding: 'utf-8' });
        const response_data = JSON.parse(result);
        return response_data;
    } catch (e) {
        console.log(`Error occurred : ${e}`);
        return "Error";
    }
}

function log(message = "", level = "INFO") {
    console.log(`[${level}] - ${message}`);
}

async function main() {
    console.log("=".repeat(36));
    const packageId = prompt("Please input Asset ID: ");

    log(`Package Asset ID: ${packageId}`);
    log("********** Checking PESAT API **********");

    const pesat_response = await call(pesat_api, packageId);
    
    console.log(pesat_response);

    if (pesat_response === "Error") {
        log("Not found in PESAT API.", "ERROR");
        return 0;
    }

    let est_offerId, rental_offerId, matId, productId;

    for (const entry of pesat_response) {
        if (entry.offerType === "pesat") {
            continue;
        }
        if (entry.offerType === "EST" && entry.serviceDomain === "TVE") {
            est_offerId = entry.ovOfferId;
        }
        if (entry.offerType === "rental" && entry.serviceDomain === "TVE") {
            rental_offerId = entry.ovOfferId;
        }
    }

    if ('assetSecondaryId' in pesat_response[0]) {
        matId = pesat_response[0].assetSecondaryId;
    }
    if (pesat_response[0].productId) {
        log("Product ID: " + pesat_response[0].productId);
        productId = pesat_response[0].productId;
    }

    if (typeof est_offerId !== 'undefined') {
        log("EST Offer ID: " + est_offerId);
    } else {
        log("No EST Id.");
    }

    if (typeof rental_offerId !== 'undefined') {
        log("Rental Offer ID: " + rental_offerId);
    } else {
        log("No Rental ID");
    }

    if (typeof matId !== 'undefined') {
        log("Material ID: " + matId);
    } else {
        log("No Material ID!", "ERROR");
    }

    console.log("\n");
    log("********** Checking CS Core **********");
    if (typeof est_offerId !== 'undefined') {
        const est_offer_core_check = await call(tve_core_api + tve_core_call, est_offerId);
        if (est_offer_core_check === "Error") {
            log("EST Offer *NOT* found in CS Core.", "ERROR");
        } else {
            log("EST Offer in CS Core.");
        }
    }

    if (typeof rental_offerId !== 'undefined') {
        const rental_offer_core_check = await call(tve_core_api + tve_core_call, rental_offerId);
        if (rental_offer_core_check === "Error") {
            log("Rental Offer *NOT* found in CS Core.", "ERROR");
        } else {
            log("Rental Offer ID in Core.");
        }
    }

    if (typeof productId !== 'undefined') {
        const productId_core_check = await call(tve_core_api + tve_uuid_check, productId);
        if (productId_core_check === "Error") {
            log("Product ID *NOT* found in CS Core.", "ERROR");
        } else {
            log("Product ID Found in CS Core.");
        }
    }

    log("Checking Material ID in Core.");
    if (typeof matId !== 'undefined') {
        const matId_core_check = await call(tve_core_api + tve_core_matID_check, matId);
        if (matId_core_check === "Error") {
            log("Material ID **NOT** found in Core.", "ERROR");
        } else {
            log("Material ID found in Core.");
            if (matId_core_check[0].customAttributes.guideCategory) {
                log("Guide Categories in Core:");
                const resourceId = matId_core_check[0].group[0];
                for (const category of matId_core_check[0].customAttributes.guideCategory) {
                    console.log("\t|-- " + category);
                }
            } else {
                log("No Guide Categories found in CS Core.", "ERROR");
            }
        }
    }
}
