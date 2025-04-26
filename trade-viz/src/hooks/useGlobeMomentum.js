import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Custom hook to handle globe momentum spinning
 * @param {React.RefObject} globeRef - Reference to the Globe component
 * @returns {Object} - Spinning state and control functions
 */
export default function useGlobeMomentum(globeRef) {
  const [isDragging, setIsDragging] = useState(false);
  const [isGlobeSpinning, setIsGlobeSpinning] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const velocityTracker = useRef([]);
  const dragStartTime = useRef(0);
  const momentumRef = useRef(null);
  
  // Initialize momentum spinning behavior
  useEffect(() => {
    if (!globeRef.current) return;
    
    const handleMouseDown = (event) => {
      // Skip if clicking on UI elements
      if (event.target.closest('button') || event.target.closest('[data-info-panel]')) {
        return;
      }
      
      // Stop any existing momentum
      if (momentumRef.current) {
        cancelAnimationFrame(momentumRef.current);
        momentumRef.current = null;
      }
      
      setIsDragging(true);
      dragStartTime.current = Date.now();
      velocityTracker.current = [];
      setLastMousePosition({ x: event.clientX, y: event.clientY });
      
      // Stop auto-rotation during drag
      setIsGlobeSpinning(false);
    };
    
    const handleMouseMove = (event) => {
      if (!isDragging) return;
      
      const currentPosition = { x: event.clientX, y: event.clientY };
      const velocity = {
        x: currentPosition.x - lastMousePosition.x,
        y: currentPosition.y - lastMousePosition.y
      };
      
      velocityTracker.current.push({
        velocity,
        timestamp: Date.now()
      });
      
      if (velocityTracker.current.length > 5) {
        velocityTracker.current.shift();
      }
      
      setLastMousePosition(currentPosition);
    };
    
    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      
      if (velocityTracker.current.length > 0) {
        // Calculate weighted average velocity
        let totalWeight = 0;
        const avgVelocity = velocityTracker.current.reduce((acc, sample, index) => {
          const weight = index + 1; // More recent samples get higher weight
          totalWeight += weight;
          
          return {
            x: acc.x + (sample.velocity.x * weight),
            y: acc.y + (sample.velocity.y * weight)
          };
        }, { x: 0, y: 0 });
        
        const finalVelocity = {
          x: avgVelocity.x / totalWeight,
          y: avgVelocity.y / totalWeight
        };
        
        const dragDuration = Date.now() - dragStartTime.current;
        const dragSpeed = Math.sqrt(finalVelocity.x ** 2 + finalVelocity.y ** 2);
        
        // Apply momentum if drag was fast enough
        if (dragSpeed > 1) {
          applyMomentum(finalVelocity.x, finalVelocity.y);
        }
      }
    };
    
    // Custom momentum animation function
    const applyMomentum = (speedX, speedY) => {
      if (!globeRef.current) return;
      
      // Cancel existing momentum
      if (momentumRef.current) {
        cancelAnimationFrame(momentumRef.current);
        momentumRef.current = null;
      }
      
      // Set globe as spinning
      setIsGlobeSpinning(true);
      
      // Configure momentum
      let rotationSpeed = Math.sqrt(speedX * speedX + speedY * speedY) * 0.03;
      const rotationAxis = new THREE.Vector3(-speedY, speedX, 0).normalize();
      const camera = globeRef.current.camera();
      
      // Animation loop with decay
      const animate = () => {
        if (rotationSpeed > 0.00005) {
          // Rotate camera around calculated axis
          camera.position.applyAxisAngle(rotationAxis, rotationSpeed);
          
          // Apply friction for natural slowdown
          rotationSpeed *= 0.995;
          
          // Force camera update
          globeRef.current.controls().update();
          
          // Continue animation
          momentumRef.current = requestAnimationFrame(animate);
        } else {
          // Stop when speed becomes negligible
          setIsGlobeSpinning(false);
          momentumRef.current = null;
        }
      };
      
      // Start animation
      momentumRef.current = requestAnimationFrame(animate);
    };
    
    // Add event listeners
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Touch support
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        handleMouseDown({
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY,
          target: e.touches[0].target
        });
      }
    };
    
    const handleTouchMove = (e) => {
      if (e.touches.length === 1 && isDragging) {
        handleMouseMove({
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY
        });
      }
    };
    
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleMouseUp);
    
    // Cleanup
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      
      if (momentumRef.current) {
        cancelAnimationFrame(momentumRef.current);
      }
    };
  }, [isDragging, globeRef]);
  
  // Function to manually toggle spinning
  const toggleSpinning = () => {
    if (globeRef.current) {
      if (isGlobeSpinning) {
        // Stop current spinning
        if (momentumRef.current) {
          cancelAnimationFrame(momentumRef.current);
          momentumRef.current = null;
        }
        setIsGlobeSpinning(false);
      } else {
        // Start standard rotation if not spinning
        const controls = globeRef.current.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.4;
        setIsGlobeSpinning(true);
      }
    }
  };
  
  return {
    isGlobeSpinning,
    toggleSpinning
  };
}