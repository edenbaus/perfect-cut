import React, { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Stage, Layer, Rect, Line, Text } from 'react-konva'

type UnitSystem = 'imperial' | 'metric'

export default function CuttingPlan() {
  const location = useLocation()
  const plan = location.state?.plan
  const [selectedSheet, setSelectedSheet] = useState(0)
  const [visibleCuts, setVisibleCuts] = useState<number | null>(null) // null = show all, number = show up to that step
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial')

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = async () => {
    // Use browser's print dialog with PDF option
    // This is the most reliable cross-browser method
    window.print()
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No cutting plan available</p>
          <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-700">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const { layouts, statistics, instructions } = plan
  const currentLayout = layouts[selectedSheet]

  // Helper function to convert inches to display units
  const convertToDisplay = (inches: number): number => {
    return unitSystem === 'metric' ? inches * 25.4 : inches
  }

  // Helper function to format dimension for display
  const formatDimension = (inches: number): string => {
    const value = convertToDisplay(inches)
    const precision = unitSystem === 'metric' ? 0 : 2
    const unit = unitSystem === 'metric' ? 'mm' : '"'
    return `${value.toFixed(precision)}${unit}`
  }

  // Find sheet dimensions from the first piece or use default
  const sheetWidth = currentLayout.pieces.length > 0
    ? Math.max(...currentLayout.pieces.map((p: any) => parseFloat(p.x) + parseFloat(p.width)))
    : 96
  const sheetHeight = currentLayout.pieces.length > 0
    ? Math.max(...currentLayout.pieces.map((p: any) => parseFloat(p.y) + parseFloat(p.height)))
    : 48

  // Determine if we should rotate (landscape sheet on portrait viewport or vice versa)
  const shouldRotate = sheetWidth < sheetHeight

  // Calculate canvas dimensions with rotation support - ensure it fits in container
  // Use a max width that accounts for container padding and ensures no scrolling
  const maxWidth = 1100  // Increased for 2fr column width
  const maxHeight = 700  // Taller for better visibility

  // Add padding margin for cut number indicators to not be cut off
  const canvasPadding = 30  // Space around edges for indicators

  const displayWidth = shouldRotate ? sheetHeight : sheetWidth
  const displayHeight = shouldRotate ? sheetWidth : sheetHeight

  // Calculate scale to fit, with padding margin for indicators
  const scale = Math.min((maxWidth - canvasPadding * 2) / displayWidth, (maxHeight - canvasPadding * 2) / displayHeight)

  const canvasWidth = Math.min(displayWidth * scale + canvasPadding * 2, maxWidth)
  const canvasHeight = Math.min(displayHeight * scale + canvasPadding * 2, maxHeight)

  // Woodworking-themed color palette - natural wood tones and workshop colors
  const colors = [
    '#8B4513', // Saddle Brown - dark wood
    '#D2691E', // Chocolate - medium wood
    '#CD853F', // Peru - light wood
    '#DEB887', // Burlywood - pine
    '#F4A460', // Sandy Brown - maple
    '#BC8F8F', // Rosy Brown - cherry
    '#A0522D', // Sienna - mahogany
    '#B8860B', // Dark Goldenrod - oak
    '#DAA520', // Goldenrod - birch
    '#C19A6B', // Camel - cedar
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 print:bg-white">
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20 print:hidden">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h1 className="text-2xl font-bold text-white">Perfect Cut</h1>
          </div>
          <Link to="/dashboard" className="text-white hover:text-amber-400 font-medium transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-[1800px]">
        <h2 className="text-4xl font-bold mb-8 text-white print:text-black print:mb-4">Cutting Plan</h2>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8 print:hidden">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-white/20">
            <p className="text-sm text-slate-400 mb-1">Sheets Used</p>
            <p className="text-3xl font-bold text-amber-400">{statistics.sheets_used}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-white/20">
            <p className="text-sm text-slate-400 mb-1">Total Cuts</p>
            <p className="text-3xl font-bold text-amber-400">{statistics.total_cuts}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-white/20">
            <p className="text-sm text-slate-400 mb-1">Waste</p>
            <p className="text-3xl font-bold text-amber-400">
              {parseFloat(statistics.total_waste_percentage).toFixed(1)}%
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-white/20">
            <p className="text-sm text-slate-400 mb-1">Est. Time</p>
            <p className="text-3xl font-bold text-amber-400">
              {statistics.estimated_time_minutes} min
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[2fr,1fr] gap-8 print:grid-cols-1">
          {/* Visualization */}
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-white/20 print:bg-white print:shadow-none print:border print:border-gray-300">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4 print:mb-4">
              <h3 className="text-2xl font-bold text-white print:text-black">Sheet Layout</h3>
              <div className="flex gap-3 items-center print:hidden">
                {/* Unit Toggle */}
                <div className="flex bg-white/10 rounded-lg p-1 border border-white/20">
                  <button
                    onClick={() => setUnitSystem('imperial')}
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                      unitSystem === 'imperial'
                        ? 'bg-amber-500 text-slate-900'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Imperial
                  </button>
                  <button
                    onClick={() => setUnitSystem('metric')}
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                      unitSystem === 'metric'
                        ? 'bg-amber-500 text-slate-900'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Metric
                  </button>
                </div>
                {/* Sheet Selector */}
                {layouts.length > 1 && (
                  <div className="flex gap-2">
                    {layouts.map((_: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSheet(index)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          selectedSheet === index
                            ? 'bg-amber-500 text-slate-900'
                            : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                        }`}
                      >
                        Sheet {index + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border border-white/20 rounded-lg flex justify-center items-center bg-slate-800/50 p-4" style={{ minHeight: canvasHeight + 32, maxWidth: '100%' }}>
              <Stage width={canvasWidth} height={canvasHeight}>
                <Layer>
                  {/* Sheet background */}
                  <Rect
                    x={canvasPadding}
                    y={canvasPadding}
                    width={displayWidth * scale}
                    height={displayHeight * scale}
                    fill="#F3F4F6"
                    stroke="#9CA3AF"
                    strokeWidth={2}
                  />

                  {/* Pieces */}
                  {currentLayout.pieces.map((piece: any, index: number) => {
                    // Handle rotation for coordinate transformation
                    let x = parseFloat(piece.x) * scale + canvasPadding
                    let y = parseFloat(piece.y) * scale + canvasPadding
                    let width = parseFloat(piece.width) * scale
                    let height = parseFloat(piece.height) * scale

                    if (shouldRotate) {
                      // Rotate 90 degrees: swap x/y and dimensions
                      const tempX = y - canvasPadding + canvasPadding
                      const tempY = (sheetWidth * scale) - (x - canvasPadding) - width + canvasPadding
                      const tempWidth = height
                      const tempHeight = width
                      x = tempX
                      y = tempY
                      width = tempWidth
                      height = tempHeight
                    }

                    const color = colors[index % colors.length]

                    // Calculate font size based on piece dimensions
                    const minDimension = Math.min(width, height)
                    const labelFontSize = Math.max(11, Math.min(18, minDimension / 3))
                    const dimensionFontSize = Math.max(9, Math.min(13, minDimension / 4))

                    const label = piece.label || `P${index + 1}`
                    const pieceWidth = parseFloat(piece.width)
                    const pieceHeight = parseFloat(piece.height)
                    const dimensions = `${formatDimension(pieceWidth)} × ${formatDimension(pieceHeight)}`

                    // Only show dimensions if piece is large enough
                    const shouldShowDimensions = minDimension > 40

                    return (
                      <React.Fragment key={index}>
                        {/* Piece fill with lighter color */}
                        <Rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          fill={color}
                          opacity={0.25}
                        />
                        {/* Strong border for clear boundaries */}
                        <Rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          fill="transparent"
                          stroke={color}
                          strokeWidth={3}
                        />
                        {/* Piece label */}
                        <Text
                          x={x + width / 2}
                          y={y + height / 2 - (shouldShowDimensions ? labelFontSize / 2 + 4 : 0)}
                          text={label}
                          fontSize={labelFontSize}
                          fontFamily="Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
                          fill="#000000"
                          align="center"
                          offsetX={label.length * labelFontSize * 0.3}
                        />
                        {/* Dimensions below label */}
                        {shouldShowDimensions && (
                          <Text
                            x={x + width / 2}
                            y={y + height / 2 + labelFontSize / 2 + 2}
                            text={dimensions}
                            fontSize={dimensionFontSize}
                            fontFamily="Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
                            fill="#000000"
                            align="center"
                            offsetX={dimensions.length * dimensionFontSize * 0.3}
                          />
                        )}
                      </React.Fragment>
                    )
                  })}

                  {/* Cut lines */}
                  {currentLayout.cuts.map((cut: any, index: number) => {
                    const cutSequence = cut.sequence || index + 1
                    // Hide cuts beyond the visible step
                    if (visibleCuts !== null && cutSequence > visibleCuts) {
                      return null
                    }

                    let x1 = parseFloat(cut.x1) * scale + canvasPadding
                    let y1 = parseFloat(cut.y1) * scale + canvasPadding
                    let x2 = parseFloat(cut.x2) * scale + canvasPadding
                    let y2 = parseFloat(cut.y2) * scale + canvasPadding

                    if (shouldRotate) {
                      // Rotate cut coordinates
                      const tempX1 = y1
                      const tempY1 = (sheetWidth * scale) - (x1 - canvasPadding) + canvasPadding
                      const tempX2 = y2
                      const tempY2 = (sheetWidth * scale) - (x2 - canvasPadding) + canvasPadding
                      x1 = tempX1
                      y1 = tempY1
                      x2 = tempX2
                      y2 = tempY2
                    }

                    const midX = (x1 + x2) / 2
                    const midY = (y1 + y2) / 2

                    // Highlight the current cut in animation mode
                    const isCurrentCut = visibleCuts !== null && cutSequence === visibleCuts
                    // Use complementary blue shades - cyan-500 for current, sky-600 for completed
                    const cutColor = isCurrentCut ? '#06B6D4' : '#0284C7'

                    return (
                      <React.Fragment key={`cut-${index}`}>
                        <Line
                          points={[x1, y1, x2, y2]}
                          stroke={cutColor}
                          strokeWidth={isCurrentCut ? 3 : 2}
                          dash={[5, 5]}
                        />
                        {/* Cut sequence number */}
                        <React.Fragment>
                          <Rect
                            x={midX - 12}
                            y={midY - 12}
                            width={24}
                            height={24}
                            fill={cutColor}
                            cornerRadius={12}
                          />
                          <Text
                            x={midX}
                            y={midY}
                            text={cutSequence.toString()}
                            fontSize={12}
                            fontFamily="Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
                            fill="white"
                            fontStyle="bold"
                            align="center"
                            verticalAlign="middle"
                            offsetX={6}
                            offsetY={6}
                          />
                        </React.Fragment>
                      </React.Fragment>
                    )
                  })}
                </Layer>
              </Stage>
            </div>

            <div className="mt-6 print:hidden">
              <p className="text-sm text-slate-300">
                Waste on this sheet: <span className="text-amber-400 font-semibold">{parseFloat(currentLayout.waste_percentage).toFixed(1)}%</span>
              </p>
            </div>

            {/* Cut Sequence Controls */}
            <div className="mt-6 border-t border-white/20 pt-6 print:hidden">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-white text-lg">Cut Sequence</h4>
                <button
                  onClick={() => {
                    if (visibleCuts === null) {
                      setVisibleCuts(1)
                    } else {
                      setVisibleCuts(null)
                    }
                  }}
                  className="text-sm px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 border border-amber-500/30 font-semibold"
                >
                  {visibleCuts === null ? 'Step-by-Step Mode' : 'Show All Cuts'}
                </button>
              </div>

              {visibleCuts !== null && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setVisibleCuts(Math.max(1, visibleCuts - 1))}
                      disabled={visibleCuts <= 1}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 font-semibold"
                    >
                      ← Previous
                    </button>
                    <span className="text-sm font-medium text-white">
                      Step {visibleCuts} of {currentLayout.cuts.length}
                    </span>
                    <button
                      onClick={() => setVisibleCuts(Math.min(currentLayout.cuts.length, visibleCuts + 1))}
                      disabled={visibleCuts >= currentLayout.cuts.length}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 font-semibold"
                    >
                      Next →
                    </button>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={currentLayout.cuts.length}
                    value={visibleCuts}
                    onChange={(e) => setVisibleCuts(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <p className="text-xs text-slate-400">
                    {currentLayout.cuts.find((c: any) => (c.sequence || 0) === visibleCuts)?.description ||
                     `Cut ${visibleCuts}`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-white/20 print:bg-white print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
            <h3 className="text-2xl font-bold mb-6 text-white print:text-black">Cutting Instructions</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 print:max-h-none print:overflow-visible">
              {instructions.map((instruction: any) => (
                <div
                  key={instruction.step}
                  className="border-l-4 border-amber-500 pl-4 py-2 bg-white/5 rounded-r-lg print:bg-gray-50 print:border-gray-400"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-amber-500 text-slate-900 rounded-full flex items-center justify-center text-sm font-bold print:bg-gray-700 print:text-white">
                      {instruction.step}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-white print:text-black">
                        {instruction.description}
                      </p>
                      <p className="text-sm text-slate-400 mt-1 print:text-gray-600">
                        {instruction.measurement}
                      </p>
                      {instruction.pieces_produced.length > 0 && (
                        <p className="text-sm text-amber-400 mt-1 print:text-gray-800">
                          Produces: {instruction.pieces_produced.join(', ')}
                        </p>
                      )}
                      {instruction.safety_note && (
                        <p className="text-sm text-orange-400 mt-1 print:text-red-600">
                          ⚠️ {instruction.safety_note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3D Visualization of Cut Pieces */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-white/20 print:hidden">
          <h3 className="text-2xl font-bold mb-6 text-white">3D Preview of Cut Pieces</h3>
          <p className="text-sm text-slate-400 mb-6">
            View all pieces with accurate proportions and thickness to compare sizes
          </p>
          <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-lg p-8 overflow-x-auto">
            <div className="flex flex-wrap gap-6 justify-center items-end min-h-[300px]">
              {currentLayout.pieces.map((piece: any, index: number) => {
                const pieceWidth = parseFloat(piece.width)
                const pieceHeight = parseFloat(piece.height)

                // Scale pieces for display (normalize to largest piece)
                const allPieces = currentLayout.pieces.map((p: any) => ({
                  w: parseFloat(p.width),
                  h: parseFloat(p.height)
                }))
                const maxDimension = Math.max(
                  ...allPieces.map((p: any) => Math.max(p.w, p.h))
                )

                // Scale to fit display (max 200px)
                const displayScale = 200 / maxDimension
                const displayWidth = pieceWidth * displayScale
                const displayHeight = pieceHeight * displayScale

                // 3D effect parameters
                const thickness = 8 // representing ~3/4" plywood thickness
                const perspective = 0.6 // for isometric view

                const color = colors[index % colors.length]
                const label = piece.label || `P${index + 1}`

                return (
                  <div key={index} className="flex flex-col items-center gap-3">
                    {/* 3D Box representation */}
                    <div
                      className="relative transition-transform hover:scale-105"
                      style={{
                        width: displayWidth,
                        height: displayHeight + thickness,
                      }}
                    >
                      {/* Top face (isometric view) */}
                      <div
                        className="absolute"
                        style={{
                          width: displayWidth,
                          height: thickness * perspective,
                          backgroundColor: color,
                          opacity: 0.9,
                          clipPath: `polygon(
                            ${thickness * perspective}px 0,
                            100% ${thickness * perspective * 0.4}px,
                            calc(100% - ${thickness * perspective}px) ${thickness * perspective}px,
                            0 ${thickness * perspective * 0.6}px
                          )`,
                          filter: 'brightness(1.3)',
                          top: 0,
                          left: 0,
                        }}
                      />
                      {/* Front face */}
                      <div
                        className="absolute border-2"
                        style={{
                          width: displayWidth,
                          height: displayHeight,
                          backgroundColor: color,
                          opacity: 0.85,
                          top: thickness * perspective,
                          left: 0,
                          borderColor: color,
                          filter: 'brightness(1.1)',
                        }}
                      >
                        {/* Wood grain effect */}
                        <div className="absolute inset-0 opacity-20" style={{
                          backgroundImage: `repeating-linear-gradient(
                            90deg,
                            transparent,
                            transparent 2px,
                            rgba(0,0,0,0.1) 2px,
                            rgba(0,0,0,0.1) 4px
                          )`
                        }} />
                      </div>
                      {/* Right face (side depth) */}
                      <div
                        className="absolute"
                        style={{
                          width: thickness,
                          height: displayHeight,
                          backgroundColor: color,
                          opacity: 0.7,
                          top: thickness * perspective,
                          left: displayWidth,
                          clipPath: `polygon(
                            0 0,
                            100% ${thickness * 0.4}px,
                            100% calc(100% - ${thickness * 0.4}px),
                            0 100%
                          )`,
                          filter: 'brightness(0.7)',
                        }}
                      />
                    </div>
                    {/* Label and dimensions */}
                    <div className="text-center">
                      <div className="font-bold text-white text-sm mb-1">{label}</div>
                      <div className="text-xs text-amber-400">
                        {formatDimension(pieceWidth)} × {formatDimension(pieceHeight)}
                      </div>
                      <div className="text-xs text-slate-500">
                        Area: {formatDimension(pieceWidth * pieceHeight)} sq
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-white/20 print:hidden">
          <h3 className="text-xl font-bold mb-4 text-white">Piece Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {currentLayout.pieces.map((piece: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-slate-300">
                  {piece.label || `Piece ${index + 1}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-8 flex gap-4 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-amber-500 text-slate-900 px-6 py-3 rounded-lg hover:bg-amber-400 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Plan
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/20 font-semibold border border-white/20 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export as PDF
          </button>
        </div>
      </div>
    </div>
  )
}
