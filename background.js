/* global browser */
//const temporary = browser.runtime.id.endsWith('@temporary-addon'); // debugging?
//const manifest = browser.runtime.getManifest();
//const extname = manifest.name;

let enddate = -1;
let tid;

async function onStorageChanged(/*changes, area*/) {
        console.log('onStorageChanged');
		try {
			const storeid = 'enddate';
			let tmp = await browser.storage.local.get(storeid);
			if (typeof tmp[storeid] === 'string'){
                console.log(tmp[storeid]);
                enddate = Date.parse(tmp[storeid]);
                updateBadge();
			}
            else{
                enddate = -1;
            }
		}catch(e){
			console.error(e);
            enddate = -1;
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

    if(enddate < 0 || enddate < Date.now()){
        browser.browserAction.setBadgeText({ text: "" });
        browser.browserAction.setIcon({
            'imageData': getIconImageData(0)
        });
        return;
    }

    let diffsecs = parseInt((enddate - Date.now())/1000)

    if(parseInt(diffsecs/60/60/24) > 0){
        browser.browserAction.setBadgeText({ text: "d" });
        diffsecs = parseInt(diffsecs/60/60/24);
        clearTimeout(tid);
        tid = setTimeout(updateBadge,60*60*24*1000);
    }else
    if(parseInt(diffsecs/60/60) > 0){
        browser.browserAction.setBadgeText({ text: "h" });
        diffsecs = parseInt(diffsecs/60/60);
        clearTimeout(tid);
        tid = setTimeout(updateBadge,60*60*1000);
    }else
    if(parseInt(diffsecs/60)  > 0){
        browser.browserAction.setBadgeText({ text: "m" });
        diffsecs = parseInt(diffsecs/60);
        clearTimeout(tid);
        tid = setTimeout(updateBadge,60*1000);
    }else{
        browser.browserAction.setBadgeText({ text: "s" });
        clearTimeout(tid);
        tid = setTimeout(updateBadge,1000);
    }

    browser.browserAction.setTitle({ title: diffsecs+"" });
     browser.browserAction.setIcon({
            'imageData': getIconImageData(diffsecs)
        });

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

browser.browserAction.setBadgeBackgroundColor({ color: '#fff00090' });
