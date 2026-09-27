const starCanvas =
    document.getElementById("stars");

const particleCanvas =
    document.getElementById("particles");


const starCtx =
    starCanvas.getContext("2d");

const particleCtx =
    particleCanvas.getContext("2d");


const messages =
    document.getElementById("messages");

const hint =
    document.getElementById("hint");



let W = window.innerWidth;

let H = window.innerHeight;



let DPR =
    Math.min(
        window.devicePixelRatio || 1,
        1.5
    );



const cores =
    navigator.hardwareConcurrency || 4;

const memory =
    navigator.deviceMemory || 4;



const lowEndDevice =
    cores <= 4 ||
    memory <= 2;



const MAX_HEARTS =
    lowEndDevice ? 2 : 3;



const PARTICLES_PER_HEART =
    lowEndDevice ? 70 : 110;



const STAR_DIVIDER =
    lowEndDevice ? 5000 : 3500;



const HEART_LIFE =
    10000;



let stars = [];

let particles = [];

let hearts = [];



const confession = [

    "I Like You",
    "I Love You",
    "So Much"
    
];



let currentMessage = 0;



let started = false;



function setupCanvas(
    canvas,
    context
) {

    canvas.width =
        Math.floor(W * DPR);

    canvas.height =
        Math.floor(H * DPR);


    canvas.style.width =
        W + "px";

    canvas.style.height =
        H + "px";


    context.setTransform(
        DPR,
        0,
        0,
        DPR,
        0,
        0
    );
}



function resize() {

    W =
        window.innerWidth;

    H =
        window.innerHeight;


    DPR =
        Math.min(
            window.devicePixelRatio || 1,
            1.5
        );


    setupCanvas(
        starCanvas,
        starCtx
    );


    setupCanvas(
        particleCanvas,
        particleCtx
    );


    createStars();
}


window.addEventListener(
    "resize",
    resize
);



function createStars() {

    stars.length = 0;



    const amount =
        Math.floor(
            (W * H) /
            STAR_DIVIDER
        );


    for (
        let i = 0;
        i < amount;
        i++
    ) {

        stars.push({

            x:
                Math.random() * W,

            y:
                Math.random() * H,

            radius:
                .3 +
                Math.random() * .9,

            alpha:
                .25 +
                Math.random() * .65,

            phase:
                Math.random() *
                Math.PI * 2
        });
    }
}



function drawStars(time) {

    starCtx.clearRect(
        0,
        0,
        W,
        H
    );


    for (const star of stars) {

        

        const alpha =
            Math.max(
                .08,

                star.alpha +
                Math.sin(
                    time * .0015 +
                    star.phase
                ) * .15
            );


        starCtx.beginPath();

        starCtx.arc(
            star.x,
            star.y,
            star.radius,
            0,
            Math.PI * 2
        );


        starCtx.fillStyle =
            `rgba(
                255,
                255,
                255,
                ${alpha}
            )`;



        starCtx.fill();
    }
}



function heartPoint(
    t,
    scale
) {

    const x =
        16 *
        Math.pow(
            Math.sin(t),
            3
        );


    const y =
        -(
            13 * Math.cos(t)
            -
            5 * Math.cos(2 * t)
            -
            2 * Math.cos(3 * t)
            -
            Math.cos(4 * t)
        );


    return {

        x:
            x * scale,

        y:
            y * scale
    };
}



function createHeart(
    centerX,
    centerY
) {

    

    if (
        hearts.length >=
        MAX_HEARTS
    ) {

        const oldHeart =
            hearts.shift();



        particles =
            particles.filter(
                particle =>
                    particle.heart !==
                    oldHeart
            );
    }



    const scale =
        Math.min(W, H) / 42;



    const heart = {

        born:
            performance.now(),

        life:
            HEART_LIFE
    };


    hearts.push(
        heart
    );



    for (
        let i = 0;
        i < PARTICLES_PER_HEART;
        i++
    ) {

        

        const t =
            (
                i /
                PARTICLES_PER_HEART
            ) *
            Math.PI * 2;


        const point =
            heartPoint(
                t,
                scale
            );



        const spread =
            (
                Math.random() -
                .5
            ) *
            3;



        const angle =
            Math.random() *
            Math.PI * 2;


        const distance =
            Math.max(W, H) *
            (
                .25 +
                Math.random() *
                .25
            );


        particles.push({

            x:
                centerX +
                Math.cos(angle) *
                distance,

            y:
                centerY +
                Math.sin(angle) *
                distance,


            targetX:
                centerX +
                point.x +
                spread,

            targetY:
                centerY +
                point.y +
                spread,


            size:
                .7 +
                Math.random() *
                1.2,


            alpha:
                .4 +
                Math.random() *
                .6,


            phase:
                Math.random() *
                Math.PI * 2,


            born:
                performance.now(),


            heart:
                heart
        });
    }
}



function drawParticles(time) {

    particleCtx.clearRect(
        0,
        0,
        W,
        H
    );



    for (
        let i =
            hearts.length - 1;

        i >= 0;

        i--
    ) {

        if (
            time -
            hearts[i].born >
            hearts[i].life
        ) {

            hearts.splice(
                i,
                1
            );
        }
    }

    

    particles =
        particles.filter(
            particle =>
                hearts.includes(
                    particle.heart
                )
        );



    for (
        const particle
        of particles
    ) {

        const age =
            time -
            particle.born;



        const pull =
            age < 900
                ? .025
                : .055;


        particle.x +=
            (
                particle.targetX -
                particle.x
            ) *
            pull;


        particle.y +=
            (
                particle.targetY -
                particle.y
            ) *
            pull;



        const pulse =
            1 +
            Math.sin(
                time * .003 +
                particle.phase
            ) *
            .25;



        const remaining =
            particle.heart.life -
            (
                time -
                particle.heart.born
            );


        const fade =
            remaining < 1200

                ? Math.max(
                    0,
                    remaining / 1200
                )

                : 1;



        particleCtx.beginPath();


        particleCtx.arc(
            particle.x,
            particle.y,
            particle.size *
                pulse,
            0,
            Math.PI * 2
        );



        particleCtx.fillStyle =
            `rgba(
                255,
                45,
                174,
                ${particle.alpha * fade}
            )`;


        particleCtx.fill();
    }
}



function showMessage(
    x,
    y
) {

    const message =
        document.createElement(
            "div"
        );


    message.className =
        "message";


    message.textContent =
        confession[
            currentMessage
        ];



    const safeX =
        Math.max(
            70,

            Math.min(
                W - 70,
                x
            )
        );


    const safeY =
        Math.max(
            90,

            Math.min(
                H - 90,
                y
            )
        );


    message.style.left =
        safeX + "px";


    message.style.top =
        safeY + "px";


    messages.appendChild(
        message
    );



    setTimeout(
        () => {

            message.classList.add(
                "out"
            );


            setTimeout(
                () => {

                    message.remove();

                },
                600
            );

        },
        8000
    );
}



window.addEventListener(
    "pointerdown",

    function (event) {

        

        hint.classList.add("hide");



        createHeart(
            event.clientX,
            event.clientY
        );



        showMessage(
            event.clientX,
            event.clientY
        );



        currentMessage =
            (
                currentMessage + 1
            ) % confession.length;

    },

    {
        passive: true
    }
);



resize();



function animationLoop(time) {

    drawStars(time);

    drawParticles(time);

    requestAnimationFrame(
        animationLoop
    );
}


requestAnimationFrame(
    animationLoop
);
