document.addEventListener('DOMContentLoaded', () => {
    
    /* 1. Preloader Setup */
    const preloader = document.querySelector('.preloader');
    const brandStrike = document.querySelector('.brand-strike');
    const slashVideo = document.querySelector('.slash-video');
    
    // Simulate loading time, animate slash, then hide
    setTimeout(() => {
        if(slashVideo) {
            slashVideo.style.opacity = '0.7';
            slashVideo.play().catch(e => console.log("Video play failed:", e));
        }

        brandStrike.style.width = '100px';
        brandStrike.style.transition = 'width 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            
            // Trigger initial animations for hero
            document.querySelectorAll('#hero .fade-in-up').forEach((el, i) => {
                setTimeout(() => {
                    el.classList.add('animate');
                }, i * 200);
            });
            
            // Stagger hero children
            const heroStaggered = document.querySelectorAll('#hero .staggered-fade');
            heroStaggered.forEach((el, i) => {
                el.classList.add('staggered-child'); // Set initial state
                setTimeout(() => {
                    el.classList.add('animate');
                }, 500 + (i * 150));
            });
            
        }, 500);
    }, 1200);


    /* 2. Custom Cursor */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const hoverTargets = document.querySelectorAll('.hover-target, a, button, .card');
    
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth follow for outline
    const animateCursor = () => {
        let distX = mouseX - outlineX;
        let distY = mouseY - outlineY;
        
        outlineX += distX * 0.2;
        outlineY += distY * 0.2;
        
        cursorOutline.style.left = `${outlineX}px`;
        cursorOutline.style.top = `${outlineY}px`;
        
        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            cursorDot.classList.add('hover');
            cursorOutline.classList.add('hover');
        });
        target.addEventListener('mouseleave', () => {
            cursorDot.classList.remove('hover');
            cursorOutline.classList.remove('hover');
        });
    });


    /* 3. Mouse Ambient Light */
    const mouseGlow = document.querySelector('.mouse-glow');
    window.addEventListener('mousemove', (e) => {
        mouseGlow.style.left = `${e.clientX}px`;
        mouseGlow.style.top = `${e.clientY}px`;
    });


    /* 4. Intersection Observers for Scroll Reveals */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    // Standard fade in up
    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach(el => {
        // Exclude hero elements as they are animated on load
        if(!el.closest('#hero')) {
            fadeObserver.observe(el);
        }
    });

    // Staggered containers
    const staggerObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const children = entry.target.querySelectorAll('.tilt-card');
                children.forEach((child, index) => {
                    child.classList.add('staggered-child');
                    child.style.opacity = "0"; // ensure invisible
                    setTimeout(() => {
                        child.classList.add('animate');
                    }, index * 150);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.staggered-container').forEach(container => {
        staggerObserver.observe(container);
    });


    /* 5. Navbar and Scroll Progress & Parallax */
    const navbar = document.getElementById('navbar');
    const progressBar = document.querySelector('.scroll-progress-bar');
    const bgKanji = document.querySelector('.bg-kanji');
    const timelineLine = document.styleSheets[0]; // Access to animate timeline psuedo element
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Navbar Scrolled State
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Navbar Hide on Scroll Down
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
        lastScrollY = currentScrollY;

        // Scroll Progress Bar
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (currentScrollY / docHeight) * 100;
        progressBar.style.width = `${scrollPercent}%`;

        // Parallax Kanji
        const speed = parseFloat(bgKanji.getAttribute('data-speed'));
        bgKanji.style.transform = `translate(-50%, calc(-50% + ${currentScrollY * speed}px))`;

        // --- Bookshelf Coverflow Animation ---
        const unveilWrapper = document.querySelector('.unveil-wrapper');
        const unveilCards   = document.querySelectorAll('.unveil-card');

        if (unveilWrapper && unveilCards.length) {
            const rect = unveilWrapper.getBoundingClientRect();
            const wrapperScrollable = unveilWrapper.offsetHeight - window.innerHeight;
            const scrolledInto = Math.max(0, -rect.top);
            // 0 → (total-1): which card is "active"
            const total = unveilCards.length;
            const activeFloat = Math.min(total - 1, (scrolledInto / wrapperScrollable) * (total - 1));

            unveilCards.forEach((card, i) => {
                // offset from the active card (negative = left, positive = right)
                const offset = i - activeFloat;
                const absOff = Math.abs(offset);
                const sign   = offset >= 0 ? 1 : -1;

                // Horizontal spread: cards fan outward
                const tx = offset * 280;

                // Depth: non-active cards pushed back
                const tz = -absOff * 120;

                // Spine rotation — each card rotates away from center like a book spine
                const rotY = sign * Math.min(absOff * 52, 75);

                // Scale & opacity — front card biggest & clearest
                const scale   = Math.max(0.6, 1 - absOff * 0.12);
                const opacity = Math.max(0.2, 1 - absOff * 0.28);

                card.style.transform = `translate(-50%, -50%) translateX(${tx}px) translateZ(${tz}px) rotateY(${rotY}deg) scale(${scale})`;
                card.style.opacity   = opacity;
                card.style.zIndex    = Math.round((total - absOff) * 10);
                
                // Highlight the focused card
                const inner = card.querySelector('.card-inner');
                if (inner) {
                    if (absOff < 0.5) {
                        inner.style.boxShadow = '0 0 60px rgba(255,0,60,0.25), 0 30px 60px rgba(0,0,0,0.6)';
                    } else {
                        inner.style.boxShadow = '';
                    }
                }
            });



        }
    });



    /* 6. Tilt Effect for Cards using Vanilla Math */
    const tiltCards = document.querySelectorAll('.tilt-card');
    
    tiltCards.forEach(card => {
        const inner = card.querySelector('.card-inner');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate rotation (max 10 degrees)
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            
            // Add subtle lighting effect based on mouse position
            if(inner) {
                // inner.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,0,60,0.1) 0%, transparent 60%)`;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            if(inner) {
                // inner.style.background = 'transparent';
            }
            // Smooth reset
            card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
            setTimeout(() => {
                card.style.transition = ''; // Remove transition for next mousemove
            }, 500);
        });
        
        card.addEventListener('mouseenter', () => {
            card.style.transition = ''; // Remove default transitions
        });
    });


    /* 7. Timeline fill animation on scroll */
    const timeline = document.querySelector('.timeline-container');
    if(timeline) {
        window.addEventListener('scroll', () => {
            const rect = timeline.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Calculate how far down the timeline we've scrolled
            if(rect.top < windowHeight / 2 && rect.bottom > 0) {
                const scrolledPast = (windowHeight / 2) - rect.top;
                const totalHeight = rect.height;
                const fillPercentage = Math.min(Math.max((scrolledPast / totalHeight) * 100, 0), 100);
                
                // We'd ideally animate the pseudo element ::after, but we can't select it directly in JS.
                // We'll update a CSS variable
                timeline.style.setProperty('--fill-height', `${fillPercentage}%`);
            }
        });
        
        // Add rule to stylesheet dynamically
        const style = document.createElement('style');
        style.innerHTML = `
            .timeline-line::after {
                height: var(--fill-height, 0%);
                transition: height 0.1s linear;
            }
        `;
        document.head.appendChild(style);
    }

    /* 8. Cinematic Divider video - ensure it plays when scrolled into view */
    const dividerVideo = document.querySelector('.divider-video');
    if (dividerVideo) {
        // Try to play immediately (works if autoplay policy allows it)
        dividerVideo.play().catch(() => {});

        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    dividerVideo.play().catch(() => {});
                } else {
                    dividerVideo.pause();
                }
            });
        }, { threshold: 0.1 });
        videoObserver.observe(dividerVideo);
    }

    /* 9. Back to top */
    document.getElementById('backToTop').addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    /* 10. Snow Particle Background */
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let W, H, flakes = [];

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width  = W * dpr;
            canvas.height = H * dpr;
            ctx.scale(dpr, dpr);
            initFlakes();
        };

        class Flake {
            constructor(randomY = false) {
                this.reset(randomY);
            }
            reset(randomY = false) {
                this.x    = Math.random() * W;
                this.y    = randomY ? Math.random() * H : -6;
                this.r    = Math.random() * 1.8 + 0.4;   // tiny: 0.4–2.2 px
                this.speed = Math.random() * 0.6 + 0.2;   // slow drift
                this.sway  = Math.random() * 0.4 - 0.2;   // gentle horizontal wobble
                this.angle = Math.random() * Math.PI * 2;  // wobble phase
                this.opacity = Math.random() * 0.5 + 0.3;  // 0.3–0.8
            }
            update() {
                this.angle += 0.008;
                this.x += Math.sin(this.angle) * this.sway;
                this.y += this.speed;
                if (this.y > H + 6) this.reset();
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
                ctx.fill();
            }
        }

        const initFlakes = () => {
            flakes = [];
            // ~1 flake per 4000px² — feels light and airy
            const count = Math.floor((W * H) / 4000);
            for (let i = 0; i < count; i++) {
                flakes.push(new Flake(true)); // scatter across full height initially
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, W, H);
            for (const f of flakes) { f.update(); f.draw(); }
            requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        animate();
    }
});
