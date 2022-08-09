/* global browser */
//const temporary = browser.runtime.id.endsWith('@temporary-addon'); // debugging?
//const manifest = browser.runtime.getManifest();
//const extname = manifest.name;

let enddate = NaN;
let enddatestr = "";
let enddatename = "";
let tid;

    const value_postfix = new Map();
    value_postfix.set(7*60*60*24, "w");
    value_postfix.set(60*60*24, "d");
    value_postfix.set(60*60, "h");
    value_postfix.set(60, "m");
    value_postfix.set(1, "s");

async function onStorageChanged(/*changes, area*/) {
        let storeid, tmp;
		try {
			storeid = 'enddate';
			tmp = await browser.storage.local.get(storeid);
			if (typeof tmp[storeid] === 'string'){
                enddate = Date.parse(tmp[storeid]);
                enddatestr = tmp[storeid];
                updateBadge();
			}
            else{
                enddate = NaN;
                enddatestr = "";
            }
		}catch(e){
			console.error(e);
            enddate = -1;
		}
		try {
			storeid = 'name';
			let tmp = await browser.storage.local.get(storeid);
			if (typeof tmp[storeid] === 'string'){
                enddatename = tmp[storeid];
			}
            else{
                enddatename = "";
            }
		}catch(e){
			console.error(e);
                enddatename = "";
		}
}



function shortTextForNumber (number) {
	if (number < 1000) {
		return number.toString()
	} else if (number < 100000) {
		return Math.floor(number / 1000)
			.toString() + "k"
	} else if (number < 1000000) {
		return Math.floor(number / 100000)
			.toString() + "hk"
	} else {
		return Math.floor(number / 1000000)
			.toString() + "m"
	}
}

function updateBadge() {

    if(enddate < 0 || isNaN(enddate) || enddate < Date.now()){
        browser.browserAction.setBadgeText({ text: "" });
        browser.browserAction.setIcon({
            'imageData': getIconImageData(0)
        });
        clearTimeout(tid);
        return;
    }



    let diffsecs = enddate - Date.now();

    for(const [k,v] of value_postfix){
        const tmp = Math.floor(diffsecs/k/1000);
        if(tmp > 0){
            browser.browserAction.setBadgeText({ text: v});
            clearTimeout(tid);
            tid = setTimeout(updateBadge,k*1000);
            browser.browserAction.setTitle({ title: "Name:" + enddatename + "\nEndtime: " + enddatestr });
            browser.browserAction.setIcon({
                'imageData': getIconImageData(tmp)
            });
            break;
        }
    }

}

/**/
function getIconImageData(rank) {
    const imageWidth = 42;
    const imageHeight = 42;
    //const markerSize = 8;
    const font = "bold 24pt 'Arial'";
    const color = "#000000";
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const addText = function(ctx, text, centerX, centerY) {
        // yellow fill
        ctx.fillStyle = '#fa6';
        ctx.fillRect(0, 0, imageWidth, imageHeight);

        // text / number
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        var maxWidth = imageWidth
        ctx.fillText(text, centerX, centerY, maxWidth);
    }
    const textOffset = 2; // trying to align text beautifully here
    const text = rank !== null ? shortTextForNumber(rank) : "n/a";
    addText(ctx, text , imageWidth / 2, imageHeight / 2 + textOffset)
    return ctx.getImageData(0, 0, imageWidth, imageHeight);
}
/**/


onStorageChanged();
browser.storage.onChanged.addListener(onStorageChanged);

//setInterval(updateBadge, 1000);
updateBadge();

browser.browserAction.setBadgeBackgroundColor({ color: '#fff00050' });

