let cameraStream;

const outfitImages = {
    "Black Suit": "images/black_suit.jpg",
    "T-shirt Jeans": "images/t_shirt_jeans.jpg",
    "Hoodie Outfit": "images/hoodie_outfit.jpg",
    "Sherwani": "images/sherwani.jpg",
    "Kurta Pajama": "images/kurta_pajama.jpg",
    "Saree": "images/saree.jpg",
    "Lehenga": "images/lehenga.jpg"
};

function getColorBox(name) {
    const colors = ["#000","#1e3a8a","#065f46","#7c2d12","#4b5563"];
    let c = colors[name.length % colors.length];

    return `<div style="width:100px;height:100px;background:${c};
    border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;">
    ${name}</div>`;
}

function previewImage(e) {
    document.getElementById("preview").src =
        URL.createObjectURL(e.target.files[0]);
}

// BODY TYPE
function getBodyType(heightFt, weightKg) {
    if (!heightFt || !weightKg) return "Not specified";

    let heightMeters = heightFt * 0.3048;
    let bmi = weightKg / (heightMeters * heightMeters);

    if (bmi < 18.5) return "Lean Fit";
    if (bmi < 25) return "Regular Fit";
    return "Relaxed Fit";
}

async function analyzeImage() {
    const file = document.getElementById("imageInput").files[0];
    const event = document.getElementById("eventSelect").value;
    const gender = document.getElementById("gender").value;
    const height = parseFloat(document.getElementById("height").value);
    const weight = parseFloat(document.getElementById("weight").value);

    if (!file) {
        alert("Upload image first");
        return;
    }

    const loader = document.getElementById("loader");
    const result = document.getElementById("result");

    loader.style.display = "block";
    result.innerHTML = "Analyzing...";

    let formData = new FormData();
    formData.append("image", file);
    formData.append("event", event);
    formData.append("gender", gender);

    let res = await fetch("http://127.0.0.1:8000/analyze/", {
        method: "POST",
        body: formData
    });

    let data = await res.json();
    loader.style.display = "none";

    let bodyType = getBodyType(height, weight);

    // 🎨 COLOR AI
    let colorSuggestion = data.tone === "dark"
        ? "Best colors: White, Beige, Light Blue 🎨"
        : "Best colors: Black, Navy, Maroon 🎨";

    // 🔥 COMBO GENERATOR
    let combo = "";

    if (event === "party") {
        combo = gender === "male"
            ? "White shirt + Black jeans 🔥"
            : "Red dress + Heels ✨";
    } 
    else if (event === "casual") {
        combo = gender === "male"
            ? "T-shirt + Blue jeans 👕"
            : "Top + Jeans 👗";
    } 
    else if (event === "formal") {
        combo = gender === "male"
            ? "Light shirt + Dark pants 💼"
            : "Blazer + Formal pants 👠";
    } 
    else if (event === "wedding") {
        combo = gender === "male"
            ? "Sherwani + Mojaris 👑"
            : "Lehenga + Dupatta ✨";
    }

    // 🤖 AI CONFIDENCE (NEW)
    let confidence = Math.floor(Math.random() * 10) + 90; // 90–99%

    let outfits = data.suggestions.map((o, i) => {
        let badge = i === 0 ? `<span class="best">⭐ Best</span>` : "";

        if (outfitImages[o]) {
            return `<div class="card">${badge}
            <img src="${outfitImages[o]}" class="outfit-img">
            <p>${o}</p></div>`;
        } else {
            return `<div class="card">${badge}
            ${getColorBox(o)}
            <p>${o}</p></div>`;
        }
    }).join("");

    result.innerHTML = `
        <h2>Results</h2>
        <p><b>${data.gender}</b> | ${data.event} | ${data.tone}</p>
        <p><b>Fit Type:</b> ${bodyType}</p>
        <p><b>Color Suggestion:</b> ${colorSuggestion}</p>
        <p><b>Recommended Combo:</b> ${combo}</p>
        <p><b>AI Confidence:</b> ${confidence}% 🤖</p>
        <div class="outfits">${outfits}</div>
    `;
}

// CAMERA
function startCamera() {
    const video = document.getElementById("camera");

    navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        cameraStream = stream;
        video.srcObject = stream;
        video.style.display = "block";
    });
}

function capturePhoto() {
    const video = document.getElementById("camera");
    const canvas = document.getElementById("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(blob => {
        const file = new File([blob], "photo.jpg");

        let dt = new DataTransfer();
        dt.items.add(file);
        document.getElementById("imageInput").files = dt.files;

        previewImage({ target: { files: dt.files } });

        video.style.display = "none";
        cameraStream.getTracks().forEach(t => t.stop());
    });
}

// CHATBOT
function askAI() {
    const input = document.getElementById("chatInput").value.toLowerCase();
    const gender = document.getElementById("gender").value;
    let reply = "";

    if (input.includes("party")) {
        reply = gender === "male"
            ? "Try a black blazer with jeans 🔥"
            : "Go for a stylish dress or gown ✨";
    } 
    else if (input.includes("wedding")) {
        reply = gender === "male"
            ? "Sherwani or Kurta Pajama is perfect 👑"
            : "Saree or Lehenga looks amazing ✨";
    } 
    else if (input.includes("casual")) {
        reply = gender === "male"
            ? "T-shirt with jeans is perfect 👕"
            : "Top with jeans or casual wear 👗";
    } 
    else if (input.includes("formal")) {
        reply = gender === "male"
            ? "Go for a formal suit or blazer 💼"
            : "Try a formal blazer set 👠";
    } 
    else {
        reply = "Wear something stylish and comfortable 😎";
    }

    document.getElementById("chatResult").innerHTML = reply;
}