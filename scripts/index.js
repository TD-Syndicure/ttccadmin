export function toDataURL(url, callback) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            var reader = new FileReader();
            reader.onloadend = function() {
                var status = xhr.status;
                if (status == 200) {
                    resolve(callback(reader.result));
                } else {
                    reject(status);
                }
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    })
}

export const uploadIMG = async (b64image, localMetadata, newTraits, enrage, newAttributes) => {
	const requestData = {
		method: "POST",
		header: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			base64image: b64image,
			metadata: JSON.stringify(localMetadata),
			newTraits: JSON.stringify(newTraits),
			enrage: enrage === true ? "true" : "false",
			attributes: JSON.stringify(newAttributes),
		}),
    }
    
    // var response = await fetch('https://immense-headland-03580.herokuapp.com/fape', requestData)
    // var response = await fetch('http://localhost:3001/ttcc', requestData)
        var response = await fetch('https://upgradestation.fracturedapes.com/ttcc', requestData)

    return(response.json());
}

export const uploadJSON = async(localMetadata) => {

    const requestData = {
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({metadata : localMetadata})
    }
    var response = await fetch('../api/uploadJSON', requestData)

    return(response.json());

}

export const updateMetadata = async(wallet, localMetadata, mint, userMetadata, newTraits, removedTrait) => {

    const requestData = {
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({publicKey: wallet, metadata: localMetadata, mint: mint, userMetadata: userMetadata, newTraits: newTraits, removedTrait: removedTrait})
    }
    var response = await fetch('../api/updateMetadata', requestData)

    return(response.json());
}

export const updateMetadata2 = async(wallet, localMetadata, mint, userMetadata, smoothies) => {

    const requestData = {
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({publicKey: wallet, metadata: localMetadata, mint: mint, userMetadata: userMetadata, smoothies: smoothies})
    }
    var response = await fetch('../api/updateMetadata2', requestData)

    return(response.json());
}

export const writeAPI = async (wallet, request, signature, extraInfo) => {

    const requestData = {
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ publicKey: wallet, request: request, signature: signature, extraInfo: extraInfo })
    }
    var response = await fetch('../api/db/write', requestData)

    return response.json()

}

export const readAPI = async (wallet, request, extraInfo) => {

    const requestData = {
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ publicKey: wallet, request: request, extraInfo: extraInfo })
    }
    var response = await fetch('../api/db/read', requestData)

    return response.json()

}

export const adminUpdate = async(mint, userMetadata) => {

    const requestData = {
		method: "POST",
		header: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			mint: mint,
			userMetadata: userMetadata,
		}),
	};
	var response = await fetch(
		"https://upgradestation.fracturedapes.com/ttcc/onChainUpdate",
		requestData
	);

    return(response.json());
}

export const adminUpdate2 = async(wallet, localMetadata, mint, userMetadata, newTraits) => {

    const requestData = {
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({publicKey: wallet, metadata: localMetadata, mint: mint, userMetadata: userMetadata, newTraits: newTraits})
    }
    var response = await fetch('../api/adminUpdate2', requestData)

    return(response.json());
}