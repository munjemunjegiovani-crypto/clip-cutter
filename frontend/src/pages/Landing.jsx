import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import heroImage from "../assets/images/hero-motocross.jpg";
import gamingImage from "../assets/images/usecase-gaming.jpg";
import sportsImage from "../assets/images/usecase-sports.jpg";
import travelImage from "../assets/images/usecase-travel.jpg";
import podcastImage from "../assets/images/usecase-podcast.jpg";

const steps = [
  {
    icon: "upload_file",
    step: "STEP 01",
    label: "Ingest",
    title: "Upload Video",
    copy: "Drag and drop an MP4, MOV, or MKV file from your device. Files stay on your laptop.",
    footer: ["Accepts: MP4, MOV, MKV", "Max 500 MB"],
    accent: "text-secondary",
  },
  {
    icon: "tune",
    step: "STEP 02",
    label: "Parameters",
    title: "Choose Settings",
    copy: "Set sensitivity, minimum clip length, clip count, and the final video length.",
    footer: ["Duration filter", "Min 5.0s"],
    accent: "text-primary",
  },
  {
    icon: "speed",
    step: "STEP 03",
    label: "Detection",
    title: "Detect Action",
    copy: "FFmpeg reads audio peaks while OpenCV measures frame-to-frame motion.",
    footer: ["Action finder", "Motion + sound"],
    accent: "text-secondary",
  },
  {
    icon: "video_library",
    step: "STEP 04",
    label: "Delivery",
    title: "Download & Stitch",
    copy: "Keep, remove, or reorder clips, then merge them into one video for CapCut.",
    footer: ["Merged video", "Ready for CapCut"],
    accent: "text-primary-fixed",
  },
];

const features = [
  {
    icon: "graphic_eq",
    title: "Motion & Sound Peaks",
    copy: "Finds rapid motion and loud audio spikes, then combines the strongest moments.",
    color: "bg-primary-container/25 text-primary",
  },
  {
    icon: "timelapse",
    title: "Minimum 5-Second Clips",
    copy: "Every detected segment is at least five seconds, so cuts have room to breathe.",
    color: "bg-secondary-container/20 text-secondary",
  },
  {
    icon: "auto_fix_high",
    title: "One-Click Merge",
    copy: "Combines your chosen clips into one continuous highlight video.",
    color: "bg-primary-container/25 text-primary",
  },
  {
    icon: "swap_horiz",
    title: "Keep, Remove & Reorder",
    copy: "Review the detected clips and arrange the order before the final merge.",
    color: "bg-secondary-container/20 text-secondary",
  },
  {
    icon: "lock",
    title: "24-Hour Auto-Delete",
    copy: "Uploaded files and rendered outputs are removed automatically after 24 hours.",
    color: "bg-primary-container/25 text-primary",
  },
  {
    icon: "movie_edit",
    title: "Made for CapCut",
    copy: "Download the merged video and bring it into CapCut for captions, music, and final edits.",
    color: "bg-secondary-container/20 text-secondary",
  },
];

const useCases = [
  {
    image: gamingImage,
    tag: "Gaming & Esports",
    title: "Clutch Moments",
    copy: "Find high-energy rounds and eliminations.",
  },
  {
    image: sportsImage,
    tag: "Action Sports",
    title: "Stunts & Tricks",
    copy: "Capture jumps, tricks, and fast movement.",
  },
  {
    image: travelImage,
    tag: "Travel Vlogs",
    title: "Montage B-Roll",
    copy: "Pull dynamic moments from long adventure footage.",
  },
  {
    image: podcastImage,
    tag: "Podcasts & Live",
    title: "Viral Soundbites",
    copy: "Find loud reactions and punchlines.",
  },
];

const faqs = [
  {
    question: "How does ClipCutter find action moments?",
    answer:
      "It reads two signals: frame-to-frame motion from OpenCV and volume peaks from the audio track. Segments where those signals rise are marked as candidates.",
  },
  {
    question: "Can I set a minimum duration for each clip?",
    answer:
      "Yes. The minimum is 5 seconds, and you can raise it before processing so no clip feels rushed.",
  },
  {
    question: "How do I edit my video in CapCut?",
    answer:
      "ClipCutter merges your chosen clips into one video file. Download it, then import it into CapCut to add music, captions, or final adjustments.",
  },
  {
    question: "Where are my files stored?",
    answer:
      "On your own laptop. Uploaded and processed files live in the backend uploads and outputs folders and are deleted automatically after 24 hours.",
  },
  {
    question: "What formats and limits are supported?",
    answer:
      "MP4, MOV, and MKV uploads are accepted. The upload limit is 500 MB and the video length limit is 30 minutes.",
  },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="relative w-full">
      <section className="relative w-full overflow-hidden px-gutter pb-space-2xl md:px-gutter-lg">
        <div className="pointer-events-none absolute left-1/2 top-12 -z-10 h-[340px] w-[700px] -translate-x-1/2 rounded-full bg-primary-container/20 blur-[130px]" />
        <div className="pointer-events-none absolute right-10 top-48 -z-10 h-[280px] w-[380px] rounded-full bg-secondary/15 blur-[110px]" />

        <div className="mx-auto flex max-w-7xl flex-col items-center pt-space-xl text-center">
          <div className="mb-space-lg inline-flex animate-fade-up items-center gap-space-xs rounded-full bg-surface-container-high/70 px-space-md py-1 shadow-sm backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            <span className="text-label-sm text-on-surface">Smart Action Clip Finder</span>
          </div>

          <h1 className="mb-space-md max-w-4xl animate-fade-up text-headline-xl-mobile tracking-tight text-on-surface md:text-headline-xl">
            Turn long videos into{" "}
            <span className="gradient-text">action-packed clips</span> in seconds
          </h1>

          <p className="mb-space-xl max-w-2xl animate-fade-up text-body-lg text-on-surface-variant">
            ClipCutter scans motion peaks and sound spikes, extracts clips of at least 5 seconds,
            and stitches them into one video ready for CapCut.
          </p>

          <div className="mb-space-2xl flex w-full animate-fade-up flex-col items-center gap-space-md sm:w-auto sm:flex-row">
            <Link
              to="/upload"
              className="inline-flex w-full items-center justify-center gap-space-sm rounded-xl bg-gradient-to-r from-primary-container to-tertiary-container px-space-xl py-3.5 text-label-lg text-on-primary-container shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(124,58,237,0.5)] sm:w-auto"
            >
              <Icon name="bolt" className="text-[20px]" />
              <span>Upload your video (Free)</span>
            </Link>
            <a
              href="#how"
              className="inline-flex w-full items-center justify-center gap-space-sm rounded-xl bg-surface-container-high/60 px-space-lg py-3.5 text-label-lg text-on-surface shadow-md backdrop-blur-md transition-all hover:bg-surface-bright sm:w-auto"
            >
              <Icon name="play_circle" className="text-[20px] text-secondary" />
              <span>See how it works</span>
            </a>
          </div>

          {/* Workbench showcase */}
          <div className="relative w-full max-w-5xl animate-fade-up rounded-2xl bg-surface-container-low p-space-sm shadow-xl sm:p-space-md">
            <div className="absolute -top-5 left-8 z-20 hidden items-center gap-space-xs rounded-full bg-surface-container-highest/90 px-space-md py-1.5 shadow-md backdrop-blur-xl md:flex">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              <span className="font-mono text-code-xs uppercase tracking-wide text-secondary">Detected highlight</span>
              <span className="text-label-sm text-on-surface">Clip (8.4s)</span>
            </div>
            <div className="absolute -top-5 right-8 z-20 hidden items-center gap-space-xs rounded-full bg-surface-container-highest/90 px-space-md py-1.5 shadow-md backdrop-blur-xl md:flex">
              <Icon name="bolt" className="text-[16px] text-primary" />
              <span className="text-label-sm text-on-surface">Motion peak found</span>
            </div>

            <div className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-surface-container-lowest shadow-inner">
              <img
                src={heroImage}
                alt="Fast action footage playing in the ClipCutter preview"
                className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-surface-dim/40" />

              <div className="absolute left-4 top-4 flex items-center gap-space-sm">
                <span className="flex items-center gap-1 rounded bg-error-container/80 px-space-sm py-1 font-mono text-code-xs uppercase tracking-wider text-on-error-container">
                  <span className="h-1.5 w-1.5 rounded-full bg-error" /> Live scrub
                </span>
                <span className="rounded bg-surface-container/70 px-space-sm py-1 font-mono text-code-xs text-on-surface backdrop-blur-md">
                  4K 60FPS · HEVC
                </span>
              </div>

              <div className="relative z-10 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-primary-container/85 text-on-primary-container shadow-[0_0_32px_rgba(124,58,237,0.7)] backdrop-blur-xl transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
                <Icon name="play_arrow" className="text-[36px] sm:text-[44px]" />
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-code-xs text-on-surface">
                <div className="flex items-center gap-space-sm rounded-lg bg-surface-container-lowest/80 px-space-md py-1 backdrop-blur-md">
                  <span className="text-secondary">SCENE 03</span>
                  <span className="text-outline-variant">|</span>
                  <span className="text-on-surface-variant">00:01:22.14 / 00:08:45.00</span>
                </div>
                <div className="hidden items-center gap-space-xs rounded-lg bg-surface-container-lowest/80 px-space-md py-1 backdrop-blur-md sm:flex">
                  <span className="text-on-surface-variant">Selected action:</span>
                  <span className="font-bold text-secondary">6 clips (1m 14s)</span>
                </div>
              </div>
            </div>

            <div className="mt-space-md flex flex-col gap-space-sm rounded-xl bg-surface-container p-space-md">
              <div className="flex items-center justify-between font-mono text-code-xs text-on-surface-variant">
                <div className="flex items-center gap-space-md">
                  <span className="flex items-center gap-1 font-semibold text-on-surface">
                    <Icon name="graphic_eq" className="text-[16px] text-secondary" />
                    Motion &amp; sound peaks
                  </span>
                  <span className="hidden rounded bg-surface-container-high px-2 py-0.5 text-primary-fixed sm:inline">
                    Min. 5s per clip
                  </span>
                </div>
                <span>Export: merged video</span>
              </div>

              <div className="relative flex h-14 w-full cursor-pointer select-none items-center overflow-hidden rounded-lg bg-surface-container-lowest px-1">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-between gap-0.5 px-3 opacity-25">
                  {[3, 6, 10, 4, 8, 11, 9, 2, 5, 10, 12, 4, 3, 8, 11, 7, 4, 9, 12, 6, 3, 8, 11, 5, 10, 3, 7, 12].map(
                    (height, index) => (
                      <span
                        key={index}
                        className={`w-1 rounded ${index % 5 === 0 ? "bg-primary" : "bg-secondary"}`}
                        style={{ height: `${height * 4}px` }}
                      />
                    ),
                  )}
                </div>
                <div className="absolute left-[8%] flex h-11 w-[14%] items-center justify-center rounded bg-secondary/20 shadow-sm transition-all hover:bg-secondary/30">
                  <span className="font-mono text-code-xs font-bold text-secondary">00:14 (6s)</span>
                </div>
                <div className="absolute left-[36%] flex h-11 w-[20%] items-center justify-between rounded bg-primary-container/45 px-2 shadow-[0_0_16px_rgba(124,58,237,0.4)]">
                  <Icon name="auto_awesome" className="text-[14px] text-primary" />
                  <span className="font-mono text-code-xs font-bold text-on-primary-container">01:22 (9.2s)</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                </div>
                <div className="absolute left-[70%] flex h-11 w-[16%] items-center justify-center rounded bg-secondary/20 shadow-sm transition-all hover:bg-secondary/30">
                  <span className="font-mono text-code-xs font-bold text-secondary">02:45 (7.5s)</span>
                </div>
                <div className="absolute left-[44%] top-0 z-10 flex h-full w-0.5 flex-col items-center bg-secondary shadow-[0_0_10px_#4cd7f6]">
                  <span className="-mt-1 h-3 w-3 rounded-full bg-secondary shadow" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-space-xl flex flex-wrap items-center justify-center gap-space-lg text-label-md text-on-surface-variant">
            <span className="flex items-center gap-1 font-semibold text-on-surface">
              <Icon name="motion_photos_on" className="text-[18px] text-secondary" />
              Motion &amp; sound detection
            </span>
            <span className="text-outline-variant">•</span>
            <span className="flex items-center gap-1 font-semibold text-on-surface">
              <Icon name="timer" className="text-[18px] text-primary" />
              Clips at least 5 seconds
            </span>
            <span className="text-outline-variant">•</span>
            <span className="flex items-center gap-1 font-semibold text-on-surface">
              <Icon name="movie_edit" className="text-[18px] text-secondary" />
              Ready to edit in CapCut
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="w-full bg-surface-container-lowest px-gutter py-space-2xl md:px-gutter-lg">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-space-2xl max-w-2xl text-center">
            <span className="mb-space-xs block font-mono text-code-xs uppercase tracking-widest text-secondary">
              Engine architecture
            </span>
            <h2 className="mb-space-sm text-headline-lg text-on-surface">How ClipCutter Slices Action</h2>
            <p className="text-body-md text-on-surface-variant">
              Four steps from long footage to a ready-to-edit highlight video.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-space-md md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.step}
                className="flex flex-col justify-between rounded-xl bg-surface-container-low p-space-lg shadow-md transition-colors hover:bg-surface-container"
              >
                <div>
                  <div className={`mb-space-md flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-high shadow-sm ${step.accent}`}>
                    <Icon name={step.icon} />
                  </div>
                  <div className="mb-space-xs flex items-center gap-space-xs">
                    <span className="rounded bg-surface-container px-2 py-0.5 font-mono text-code-xs font-bold text-primary">
                      {step.step}
                    </span>
                    <span className="text-label-sm text-on-surface-variant">{step.label}</span>
                  </div>
                  <h3 className="mb-space-xs text-headline-md text-on-surface">{step.title}</h3>
                  <p className="mb-space-md text-body-sm text-on-surface-variant">{step.copy}</p>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface-container-lowest/80 p-space-sm font-mono text-code-xs text-on-surface-variant">
                  <span>{step.footer[0]}</span>
                  <span className="font-semibold text-secondary">{step.footer[1]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="w-full px-gutter py-space-2xl md:px-gutter-lg">
        <div className="mx-auto max-w-7xl">
          <div className="mb-space-2xl flex flex-col justify-between gap-space-md md:flex-row md:items-end">
            <div>
              <span className="mb-space-xs block font-mono text-code-xs uppercase tracking-widest text-primary">
                Engine capabilities
              </span>
              <h2 className="text-headline-lg text-on-surface">Designed for Fast Highlight Cutting</h2>
            </div>
            <p className="max-w-md text-body-md text-on-surface-variant">
              No bloated editor. ClipCutter does one job: find the energetic moments and cut them out.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-space-lg md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-surface-container-low/80 p-space-lg shadow-md backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`mb-space-md flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                  <Icon name={feature.icon} className="text-[28px]" />
                </div>
                <h3 className="mb-space-xs text-headline-md text-on-surface">{feature.title}</h3>
                <p className="text-body-md text-on-surface-variant">{feature.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="w-full bg-surface-container-lowest px-gutter py-space-2xl md:px-gutter-lg">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-space-2xl max-w-2xl text-center">
            <span className="mb-space-xs block font-mono text-code-xs uppercase tracking-widest text-secondary">
              Target footage
            </span>
            <h2 className="mb-space-sm text-headline-lg text-on-surface">Built for High-Energy Video</h2>
            <p className="text-body-md text-on-surface-variant">Great for fast-paced footage of all types.</p>
          </div>

          <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((item) => (
              <div key={item.title} className="group relative flex flex-col overflow-hidden rounded-xl bg-surface-container-low shadow-md">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 rounded bg-surface-container-highest/80 px-2 py-0.5 font-mono text-code-xs text-secondary backdrop-blur-md">
                    {item.tag}
                  </span>
                </div>
                <div className="p-space-md">
                  <h4 className="mb-1 text-headline-md text-on-surface">{item.title}</h4>
                  <p className="text-body-sm text-on-surface-variant">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free plans */}
      <section id="pricing" className="w-full px-gutter py-space-2xl md:px-gutter-lg">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-space-2xl max-w-xl text-center">
            <span className="mb-space-xs block font-mono text-code-xs uppercase tracking-widest text-primary">
              No paid tiers
            </span>
            <h2 className="mb-space-sm text-headline-lg text-on-surface">Free on Your Own Laptop</h2>
            <p className="text-body-md text-on-surface-variant">
              No subscription, no watermark, no cloud upload. Just local processing.
            </p>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-space-lg md:grid-cols-2">
            <div className="flex flex-col justify-between rounded-2xl bg-surface-container-low p-space-xl shadow-md">
              <div>
                <div className="mb-space-md flex items-center justify-between">
                  <span className="text-label-lg text-on-surface-variant">Free Local</span>
                  <span className="rounded bg-surface-container px-2 py-0.5 font-mono text-code-xs text-on-surface-variant">
                    Hobbyist
                  </span>
                </div>
                <div className="mb-space-lg flex items-baseline gap-space-xs">
                  <span className="text-headline-xl font-bold text-on-surface">$0</span>
                  <span className="text-body-sm text-on-surface-variant">/ forever</span>
                </div>
                <ul className="mb-space-xl space-y-space-md text-body-md text-on-surface-variant">
                  {[
                    "Uploads up to 500 MB",
                    "Videos up to 30 minutes",
                    "Motion and loud-sound detection",
                    "Minimum 5-second clips",
                    "Merged download for CapCut",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-space-sm">
                      <Icon name="check" className="text-[18px] text-secondary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/upload"
                className="w-full rounded-xl bg-surface-container-high py-3 text-center text-label-lg text-on-surface shadow-sm transition-colors hover:bg-surface-bright"
              >
                Start free
              </Link>
            </div>

            <div className="relative flex flex-col justify-between rounded-2xl bg-gradient-to-b from-surface-container to-surface-container-low p-space-xl shadow-xl">
              <div className="absolute -top-3.5 right-6 rounded-full bg-gradient-to-r from-primary-container to-secondary-container px-3 py-1 font-mono text-code-xs font-bold uppercase tracking-wider text-on-primary-container shadow-md">
                Everything included
              </div>
              <div>
                <div className="mb-space-md flex items-center justify-between">
                  <span className="text-label-lg font-bold text-primary">Self-Hosted</span>
                  <span className="rounded bg-primary-container/20 px-2 py-0.5 font-mono text-code-xs text-primary-fixed">
                    Local
                  </span>
                </div>
                <div className="mb-space-lg flex items-baseline gap-space-xs">
                  <span className="text-headline-xl font-bold text-on-surface">$0</span>
                  <span className="text-body-sm text-on-surface-variant">/ forever</span>
                </div>
                <ul className="mb-space-xl space-y-space-md text-body-md text-on-surface">
                  {[
                    "Runs with local FFmpeg and OpenCV",
                    "Files stored on your machine",
                    "Automatic 24-hour file deletion",
                    "Keep, remove, and reorder clips",
                    "No accounts required for local use",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-space-sm">
                      <Icon name="check_circle" className="text-[18px] text-secondary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/privacy"
                className="w-full rounded-xl bg-gradient-to-r from-primary-container to-tertiary-container py-3.5 text-center text-label-lg text-on-primary-container shadow-xl transition-all hover:shadow-[0_0_24px_rgba(124,58,237,0.5)]"
              >
                Read the privacy page
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="w-full bg-surface-container-lowest px-gutter py-space-2xl md:px-gutter-lg">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto mb-space-2xl max-w-xl text-center">
            <span className="mb-space-xs block font-mono text-code-xs uppercase tracking-widest text-secondary">
              Frequently asked questions
            </span>
            <h2 className="mb-space-sm text-headline-lg text-on-surface">Got Questions? We’ve Got Answers.</h2>
            <p className="text-body-md text-on-surface-variant">
              What to expect from detection, storage, and exports.
            </p>
          </div>

          <div className="space-y-space-md">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.question} className="overflow-hidden rounded-xl bg-surface-container-low shadow-sm">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between p-space-lg text-left text-on-surface transition-colors hover:text-primary"
                  >
                    <span className="text-headline-md">{faq.question}</span>
                    <Icon
                      name="expand_more"
                      className={`text-[22px] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-space-lg pb-space-lg text-body-md text-on-surface-variant">{faq.answer}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="w-full px-gutter py-space-2xl md:px-gutter-lg">
        <div className="relative mx-auto flex max-w-5xl flex-col items-center overflow-hidden rounded-3xl bg-gradient-to-r from-primary-container via-surface-container-high to-surface-container p-space-xl text-center shadow-2xl sm:p-space-2xl">
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
          <span className="mb-space-md rounded-full bg-surface-container-lowest/80 px-3 py-1 font-mono text-code-xs uppercase tracking-widest text-secondary">
            Local workflow
          </span>
          <h2 className="mb-space-md max-w-2xl text-headline-xl-mobile text-on-primary-container md:text-headline-xl">
            Ready to cut hours of trimming down to minutes?
          </h2>
          <p className="mb-space-xl max-w-xl text-body-lg text-on-primary-container/80">
            Upload your video, choose your settings, and let ClipCutter stitch the action moments together.
          </p>
          <Link
            to="/upload"
            className="inline-flex w-full items-center justify-center gap-space-sm rounded-xl bg-surface px-space-xl py-4 text-label-lg text-on-surface shadow-xl transition-all hover:bg-surface-bright sm:w-auto"
          >
            <Icon name="cloud_upload" className="text-[20px] text-secondary" />
            <span>Upload your video for free</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
