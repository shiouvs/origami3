# 3D Origami Box Simulator

A professional, realistic 3D origami simulation that demonstrates a simple origami box folding process with smooth animations and interactive controls.

## Features

✨ **Realistic Paper Folding Simulation**
- 6-step folding sequence from flat paper to complete box
- Smooth, physics-based crease animations
- Realistic paper material with proper lighting and shadows

🎮 **Interactive Controls**
- Play/Pause animation
- Adjustable animation speed (0.5x - 3.0x)
- Reset to beginning
- Auto-rotate view
- Mouse controls for 3D navigation

🎨 **Professional Design**
- Modern, gradient UI
- Responsive layout
- Real-time progress tracking
- Step-by-step descriptions

## Technologies Used

- **Three.js** - 3D rendering engine
- **HTML5/CSS3** - Modern web interface
- **JavaScript ES6+** - Animation and interaction logic
- **WebGL** - Hardware-accelerated graphics

## How to Use

### Quick Start

1. Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)
2. Click the **Play** button to start the folding animation
3. Use your mouse to interact with the 3D view:
   - **Left-click + drag** to rotate the view
   - **Scroll wheel** to zoom in/out
   - **Right-click + drag** to pan

### Controls

**Animation Controls:**
- **Play** - Start the folding animation
- **Pause** - Pause at current step
- **Reset** - Return to flat paper (step 0)

**Speed Control:**
- Use the slider to adjust animation speed from 0.5x to 3.0x

**View Controls:**
- **Auto-Rotate** - Enable automatic rotation of the model
- **Reset View** - Return camera to default position

### Folding Steps

The simulation demonstrates these 6 steps:

1. **Starting Position** - Square paper ready to fold
2. **Mark Center Lines** - Creating center creases
3. **Fold Corners** - Folding corners to center
4. **Prepare Walls** - Preparing to lift walls
5. **Lift Walls** - Lifting walls vertically
6. **Complete Box** - Final box shape with clean walls and flat bottom

## File Structure

```
origami-simulation/
├── index.html              # Main HTML structure
├── styles.css              # Professional styling
├── origami-simulation.js   # 3D simulation engine
└── README.md              # This file
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Note:** Requires WebGL support. Most modern browsers support this by default.

## Technical Details

### 3D Rendering
- Uses Three.js for WebGL rendering
- Real-time vertex manipulation for folding effects
- Phong material for realistic paper appearance
- Multiple light sources for depth and realism

### Animation System
- Easing functions for smooth transitions
- Step-based animation with progress tracking
- Configurable animation speed
- Vertex-level transformations for realistic folds

### Performance
- Optimized geometry updates
- Efficient shadow mapping
- Smooth 60 FPS rendering on modern hardware

## Customization

You can customize the simulation by modifying [`origami-simulation.js`](origami-simulation.js:1):

- **Paper Color**: Change the `color` property in [`createPaper()`](origami-simulation.js:95)
- **Paper Size**: Adjust the `size` variable in [`createPaper()`](origami-simulation.js:95)
- **Animation Speed**: Modify default speed in constructor
- **Camera Position**: Adjust initial position in [`setupScene()`](origami-simulation.js:38)

## Future Enhancements

Potential improvements for future versions:
- Multiple origami patterns (crane, butterfly, flower, etc.)
- Custom paper textures and colors
- Export animation as video
- VR/AR support
- Step-by-step tutorial mode
- Save/load animation states

## Credits

Created as a demonstration of realistic 3D paper folding simulation using web technologies.

## License

This project is open source and available for educational and personal use.

---

**Enjoy folding! 🦢**