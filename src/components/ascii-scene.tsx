"use client"

import { useState, useEffect, useRef } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { EffectComposer } from "@react-three/postprocessing"
import { OrbitControls } from "@react-three/drei"
import { Vector2, VideoTexture, LinearFilter } from "three"
import { AsciiEffect } from "./ascii-effect"

interface AsciiSceneProps {
  videoSrc?: string
  height?: string
}

function VideoPlane({ videoSrc }: { videoSrc: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoTexture, setVideoTexture] = useState<VideoTexture | null>(null)
  const [videoAspect, setVideoAspect] = useState(16 / 9)
  const { viewport } = useThree()

  useEffect(() => {
    const video = document.createElement("video")
    video.src = videoSrc
    video.crossOrigin = "anonymous"
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.autoplay = true
    
    // Get video dimensions once metadata is loaded
    video.addEventListener('loadedmetadata', () => {
      setVideoAspect(video.videoWidth / video.videoHeight)
    })
    
    video.play().catch(console.error)
    
    videoRef.current = video
    
    const texture = new VideoTexture(video)
    texture.minFilter = LinearFilter
    texture.magFilter = LinearFilter
    setVideoTexture(texture)
    
    return () => {
      video.pause()
      video.src = ""
      texture.dispose()
    }
  }, [videoSrc])

  if (!videoTexture) return null

  // Calculate scale to cover viewport (like object-fit: cover)
  const viewportAspect = viewport.width / viewport.height
  
  let scale: [number, number, number]
  if (viewportAspect > videoAspect) {
    // Viewport is wider than video - fit to width
    scale = [viewport.width, viewport.width / videoAspect, 1]
  } else {
    // Viewport is taller than video - fit to height
    scale = [viewport.height * videoAspect, viewport.height, 1]
  }

  return (
    <mesh scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={videoTexture} />
    </mesh>
  )
}

export function AsciiScene({ videoSrc, height = "100vh" }: AsciiSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState(new Vector2(0, 0))
  const [resolution, setResolution] = useState(new Vector2(1920, 1080))

  // Track mouse position for glow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        // Flip Y coordinate to match shader UV space (bottom-up instead of top-down)
        const y = rect.height - (e.clientY - rect.top)
        setMousePos(new Vector2(x, y))
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)

      // Set initial resolution
      const rect = container.getBoundingClientRect()
      setResolution(new Vector2(rect.width, rect.height))

      // Update resolution on resize
      const handleResize = () => {
        const rect = container.getBoundingClientRect()
        setResolution(new Vector2(rect.width, rect.height))
      }
      window.addEventListener("resize", handleResize)

      return () => {
        container.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [])

  return (
    <div ref={containerRef} style={{ width: "100%", height }} className="relative overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: "#212121" }}
      >
        <color attach="background" args={["#212121"]} />

        {videoSrc && <VideoPlane videoSrc={videoSrc} />}

        {/* ASCII Effect with PostFX */}
        <EffectComposer>
          <AsciiEffect
            style={"standard"}
            cellSize={6}
            invert={false}
            color={false}
            resolution={resolution}
            mousePos={mousePos}
            postfx={{
              scanlineIntensity: 0,
              scanlineCount: 200,
              targetFPS: 0,
              jitterIntensity: 0,
              jitterSpeed: 1,
              mouseGlowEnabled: false,
              mouseGlowRadius: 130,
              mouseGlowIntensity: 0.1,
              vignetteIntensity: 0,
              vignetteRadius: 0.8,
              colorPalette: "original",
              curvature: 0,
              aberrationStrength: 0,
              noiseIntensity: 0,
              noiseScale: 1,
              noiseSpeed: 1,
              waveAmplitude: 0,
              waveFrequency: 10,
              waveSpeed: 1,
              glitchIntensity: 0,
              glitchFrequency: 0,
              brightnessAdjust: 0,
              contrastAdjust: 1,
            }}
          />
        </EffectComposer>
      </Canvas>
      <div className="absolute inset-0 pointer-events-none bg-white/15" />
      <div className="absolute inset-0 pointer-events-none bg-black/30" />
    </div>
  )
}
