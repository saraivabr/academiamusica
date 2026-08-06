"use client";

import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "../lib/gsap";

const shellSelector = [
  ".br-nav",
  ".portal-header",
  ".academy-sidebar",
  ".academy-top",
].join(",");

const interactiveSelector = [
  "a",
  "button",
  "summary",
  "[role='button']",
].join(",");

const dynamicSelector = [
  "[role='alert']",
  "[role='dialog']",
  "[role='status']",
  ".express-scene",
  ".express-results",
  ".credit-checkout",
  ".pix-card",
].join(",");

function isMotionExcluded(element: Element) {
  return Boolean(element.closest(
    "[data-motion='off'], .academy-player, .cookie-consent, script, style",
  ));
}

function collectRevealTargets() {
  const contentRoot = document.querySelector<HTMLElement>(
    ".br-home, #login-experience, .academy-main, .portal",
  );
  if (!contentRoot) return [];

  const semanticTargets = Array.from(
    contentRoot.querySelectorAll<HTMLElement>("section, article"),
  ).filter((element) => {
    if (isMotionExcluded(element)) return false;
    const semanticParent = element.parentElement?.closest("section, article");
    return !semanticParent || !contentRoot.contains(semanticParent);
  });

  if (semanticTargets.length) return semanticTargets;

  const main = contentRoot.matches("main")
    ? contentRoot
    : contentRoot.querySelector<HTMLElement>("main");
  if (!main) return [contentRoot];

  const directChildren = Array.from(main.children)
    .filter((element): element is HTMLElement => element instanceof HTMLElement)
    .filter((element) => !isMotionExcluded(element));

  return directChildren.length ? directChildren : [main];
}

function animateDynamicElement(element: HTMLElement) {
  if (isMotionExcluded(element) || element.dataset.motionEntered === "true") return;
  element.dataset.motionEntered = "true";
  gsap.fromTo(
    element,
    { y: 14, scale: 0.992, autoAlpha: 0 },
    {
      y: 0,
      scale: 1,
      autoAlpha: 1,
      duration: 0.42,
      ease: "power3.out",
      clearProps: "transform,opacity,visibility,will-change",
      overwrite: "auto",
    },
  );
}

export default function GlobalMotion() {
  const pathname = usePathname();

  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add(
      {
        reduceMotion: "(prefers-reduced-motion: reduce)",
        finePointer: "(hover: hover) and (pointer: fine)",
        compact: "(max-width: 840px)",
      },
      (context) => {
        const {
          compact,
          finePointer,
          reduceMotion,
        } = context.conditions as {
          compact: boolean;
          finePointer: boolean;
          reduceMotion: boolean;
        };

        if (reduceMotion) {
          const enteredTargets = document.querySelectorAll("[data-motion-entered]");
          if (enteredTargets.length) {
            gsap.set(enteredTargets, {
              clearProps: "transform,opacity,visibility,will-change",
            });
          }
          return;
        }

        let cleanObservers = () => {};
        const animationContext = gsap.context(() => {
          const shellElements = Array.from(
            document.querySelectorAll<HTMLElement>(shellSelector),
          ).filter((element) => !isMotionExcluded(element));

          if (shellElements.length) {
            gsap.fromTo(
              shellElements,
              {
                y: compact ? -6 : -10,
                autoAlpha: 0,
                willChange: "transform,opacity",
              },
              {
                y: 0,
                autoAlpha: 1,
                duration: compact ? 0.38 : 0.52,
                ease: "power3.out",
                stagger: 0.045,
                clearProps: "transform,opacity,visibility,will-change",
              },
            );
          }

          const revealTargets = collectRevealTargets();
          const pendingRevealTargets = revealTargets.filter(
            (element) => element.dataset.motionEntered !== "true",
          );
          const reveal = (element: HTMLElement, index = 0) => {
            if (element.dataset.motionEntered === "true") return;
            element.dataset.motionEntered = "true";
            gsap.to(element, {
              y: 0,
              scale: 1,
              autoAlpha: 1,
              duration: compact ? 0.46 : 0.62,
              delay: Math.min(index * 0.055, 0.22),
              ease: "power3.out",
              clearProps: "transform,opacity,visibility,will-change",
              overwrite: "auto",
            });
          };

          if (pendingRevealTargets.length) {
            gsap.set(pendingRevealTargets, {
              y: compact ? 16 : 24,
              scale: compact ? 0.995 : 0.99,
              autoAlpha: 0,
              transformOrigin: "50% 20%",
              willChange: "transform,opacity",
            });
          }

          const observer = new IntersectionObserver(
            (entries) => {
              entries
                .filter((entry) => entry.isIntersecting)
                .sort(
                  (first, second) =>
                    first.boundingClientRect.top - second.boundingClientRect.top,
                )
                .forEach((entry, index) => {
                  const element = entry.target as HTMLElement;
                  reveal(element, index);
                  observer.unobserve(element);
                });
            },
            {
              rootMargin: compact ? "0px 0px -4% 0px" : "0px 0px -10% 0px",
              threshold: compact ? 0.05 : 0.12,
            },
          );

          pendingRevealTargets.forEach((element) => observer.observe(element));

          const dynamicElements = new Set<HTMLElement>();
          const animateAddedElement = (element: HTMLElement) => {
            dynamicElements.add(element);
            animateDynamicElement(element);
          };
          const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (!(node instanceof HTMLElement)) return;
                if (node.matches(dynamicSelector)) animateAddedElement(node);
                node.querySelectorAll<HTMLElement>(dynamicSelector)
                  .forEach(animateAddedElement);
              });
            });
          });

          mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
          });

          cleanObservers = () => {
            observer.disconnect();
            mutationObserver.disconnect();
            if (revealTargets.length) gsap.killTweensOf(revealTargets);
            const animatedDynamicElements = Array.from(dynamicElements);
            if (animatedDynamicElements.length) {
              gsap.killTweensOf(animatedDynamicElements);
              gsap.set(animatedDynamicElements, {
                clearProps: "transform,opacity,visibility,will-change",
              });
            }
          };
        }, document.body);

        if (!finePointer) {
          return () => {
            cleanObservers();
            animationContext.revert();
          };
        }

        const activeInteractions = new Set<HTMLElement>();
        const animatedIcons = new Set<HTMLElement>();

        const resolveInteractive = (event: Event) => {
          const target = event.target;
          if (!(target instanceof Element)) return null;
          const interactive = target.closest<HTMLElement>(interactiveSelector);
          if (
            !interactive
            || isMotionExcluded(interactive)
            || interactive.matches(":disabled, [aria-disabled='true']")
          ) {
            return null;
          }
          return interactive;
        };

        const enter = (event: Event) => {
          const interactive = resolveInteractive(event);
          if (!interactive || activeInteractions.has(interactive)) return;
          activeInteractions.add(interactive);

          const isMenuItem = Boolean(interactive.closest("nav"));
          gsap.to(interactive, {
            y: isMenuItem ? -1 : -2,
            scale: isMenuItem ? 1.01 : 1.015,
            duration: 0.24,
            ease: "power2.out",
            overwrite: "auto",
          });

          const icon = interactive.querySelector<HTMLElement>("svg");
          if (icon) {
            animatedIcons.add(icon);
            gsap.to(icon, {
              rotation: isMenuItem ? 3 : 0,
              scale: 1.06,
              duration: 0.28,
              ease: "back.out(1.8)",
              overwrite: "auto",
            });
          }
        };

        const leave = (event: Event) => {
          const interactive = resolveInteractive(event);
          if (!interactive) return;

          const nextTarget = "relatedTarget" in event
            ? event.relatedTarget
            : null;
          if (nextTarget instanceof Node && interactive.contains(nextTarget)) return;

          activeInteractions.delete(interactive);
          gsap.to(interactive, {
            y: 0,
            scale: 1,
            duration: 0.32,
            ease: "power3.out",
            clearProps: "transform",
            overwrite: "auto",
          });

          const icon = interactive.querySelector<HTMLElement>("svg");
          if (icon) {
            gsap.to(icon, {
              rotation: 0,
              scale: 1,
              duration: 0.28,
              ease: "power3.out",
              clearProps: "transform",
              overwrite: "auto",
            });
          }
        };

        document.addEventListener("pointerover", enter);
        document.addEventListener("pointerout", leave);
        document.addEventListener("focusin", enter);
        document.addEventListener("focusout", leave);

        return () => {
          document.removeEventListener("pointerover", enter);
          document.removeEventListener("pointerout", leave);
          document.removeEventListener("focusin", enter);
          document.removeEventListener("focusout", leave);
          const interactionTargets = Array.from(activeInteractions);
          const iconTargets = Array.from(animatedIcons);
          if (interactionTargets.length) {
            gsap.killTweensOf(interactionTargets);
            gsap.set(interactionTargets, { clearProps: "transform" });
          }
          if (iconTargets.length) {
            gsap.killTweensOf(iconTargets);
            gsap.set(iconTargets, { clearProps: "transform" });
          }
          cleanObservers();
          animationContext.revert();
        };
      },
    );

    return () => media.revert();
  }, {
    dependencies: [pathname],
    revertOnUpdate: true,
  });

  return null;
}
