const express = require("express");
const bodyParser = require("body-parser");
const svgCaptcha = require("svg-captcha");
const crypto = require("crypto");
const dayjs = require("dayjs");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.json());

let captchas = new Map();
const SECRET_KEY = "your-secret-key";
const CAPTCHA_TIMEOUT = 5 * 60 * 1000;
const CLICK_LIMIT = 10;
const CLICK_TIMEOUT = 60000;

function generateDynamicHashKey() {
    return crypto.randomBytes(16).toString("hex");
}

function doubleHash(input, secretKey) {
    const firstHash = crypto.createHmac("sha256", secretKey).update(input).digest("hex");

    const secondHash = crypto.createHmac("sha256", secretKey).update(firstHash).digest("hex");

    return secondHash;
}

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: "Too many requests from this IP, please try again after 15 minutes.",
});

app.use(limiter);

let ipRequestCount = {};
let buttonClickCount = {};

function generateTooManyRequestsImage() {
    const captcha = svgCaptcha.create({
        text: "Oops!",
        noise: 3,
        color: true,
        size: 6,
    });

    return captcha.data;
}

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/generate-captcha", (req, res) => {
    const captcha = svgCaptcha.create({ noise: 3, color: true, size: 6 });
    const token = Math.random().toString(36).substr(2);

    const dynamicHashKey = generateDynamicHashKey();
    const captchaHash = doubleHash(captcha.text.toLowerCase(), dynamicHashKey);

    const expirationTime = dayjs().add(CAPTCHA_TIMEOUT, "millisecond").toISOString();

    captchas.set(token, {
        text: captcha.text,
        hash: captchaHash,
        expiration: expirationTime,
        dynamicHashKey: dynamicHashKey,
    });

    res.json({ token, svg: captcha.data });
});

app.post("/track-button-click", (req, res) => {
    const clientIp = req.ip;

    buttonClickCount[clientIp] = (buttonClickCount[clientIp] || 0) + 1;

    if (buttonClickCount[clientIp] > CLICK_LIMIT) {
        return res.json({
            success: false,
            message: "Too many button clicks. Please wait.",
        });
    }

    setTimeout(() => {
        buttonClickCount[clientIp] = 0;
    }, CLICK_TIMEOUT);

    res.json({ success: true });
});

app.post("/verify-captcha", (req, res) => {
    const { token, userInput, userAgent, mouseMovementDuration } = req.body;
    const captchaData = captchas.get(token);

    const clientIp = req.ip;

    if (ipRequestCount[clientIp] && ipRequestCount[clientIp] > 10) {
        console.log("Too many requests from IP:", clientIp);
        return res.json({
            success: false,
            message: "Too many requests. Please try again later.",
            svg: generateTooManyRequestsImage(),
            code: 429,
        });
    }

    ipRequestCount[clientIp] = (ipRequestCount[clientIp] || 0) + 1;

    if (captchaData) {
        const { hash, expiration, dynamicHashKey } = captchaData;
        const currentTime = dayjs().toISOString();

        if (dayjs(currentTime).isAfter(expiration)) {
            captchas.delete(token);
            return res.json({ success: false, message: "CAPTCHA expired." });
        }

        const userInputTrimmed = userInput.trim().toLowerCase();
        const captchaTextTrimmed = captchaData.text.trim().toLowerCase();

        const userHash = doubleHash(userInputTrimmed, dynamicHashKey);
        const expectedHash = hash;

        if (userHash === expectedHash) {
            captchas.delete(token);

            const agent = userAgent || req.headers["user-agent"] || "";

            if (agent.includes("bot") || mouseMovementDuration < 500) {
                return res.json({ success: false, message: "Bot behavior detected" });
            }

            return res.json({ success: true });
        } else {
            return res.json({ success: false, message: "CAPTCHA verification failed." });
        }
    } else {
        return res.json({ success: false, message: "Invalid CAPTCHA token." });
    }
});

app.listen(3000, () => {
    console.log("CAPTCHA server running at http://localhost:3000");
});

/*
Github: /egehan0250

Advanced-Captcha

More reliable captcha with v2 system

Features

        Rate limiting
        IP tracking
        Button click tracking
        Mouse movement tracking
        Dynamic hashing
        Double hashing
        CAPTCHA expiration
        CAPTCHA token system
        CAPTCHA verification
        Bot detection
        Too many requests detection
        Too many button clicks detection
        Too fast mouse movement detection
        SVG CAPTCHA generation
        Express.js server
        JSON responses
        Error handling
        Logging
        Customizable settings
        Easy to use
        Easy to deploy
        Open source
*/