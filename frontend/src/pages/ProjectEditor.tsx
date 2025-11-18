import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@tanstack/react-query'
import { projectsApi, Sheet, Piece } from '../api/projects'
import { UnitSystem, toDisplayValue, toInternalValue, getUnitLabel, getInputStep } from '../utils/units'

interface ProjectForm {
  name: string
  description: string
  unit_system: UnitSystem
}

export default function ProjectEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [pieces, setPieces] = useState<Piece[]>([])
  const [optimizationMode, setOptimizationMode] = useState('waste')
  const [kerfWidth, setKerfWidth] = useState(0.125)
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial')

  const { register, handleSubmit, setValue, watch } = useForm<ProjectForm>({
    defaultValues: {
      unit_system: 'imperial'
    }
  })

  // Load existing project
  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (project) {
      setValue('name', project.name)
      setValue('description', project.description || '')
      setValue('unit_system', project.unit_system || 'imperial')
      setUnitSystem(project.unit_system || 'imperial')
      setSheets(project.sheets || [])
      setPieces(project.pieces || [])
    }
  }, [project, setValue])

  // Watch for unit system changes
  useEffect(() => {
    const subscription = watch((value) => {
      if (value.unit_system && value.unit_system !== unitSystem) {
        setUnitSystem(value.unit_system as UnitSystem)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, unitSystem])

  // Save project mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ProjectForm) => {
      const projectData = {
        ...data,
        sheets,
        pieces,
      }
      if (id) {
        return projectsApi.update(id, projectData)
      } else {
        return projectsApi.create(projectData)
      }
    },
    onSuccess: (data) => {
      if (!id) {
        navigate(`/projects/${data.id}`)
      }
    },
  })

  const onSubmit = (data: ProjectForm) => {
    saveMutation.mutate(data)
  }

  const addSheet = () => {
    setSheets([...sheets, { width: 96, height: 48, quantity: 1, thickness: 0.75, has_grain: false }])
  }

  const updateSheet = (index: number, field: keyof Sheet, value: any) => {
    const newSheets = [...sheets]
    newSheets[index] = { ...newSheets[index], [field]: value }
    setSheets(newSheets)
  }

  const removeSheet = (index: number) => {
    setSheets(sheets.filter((_, i) => i !== index))
  }

  const addPiece = () => {
    setPieces([...pieces, { width: 24, height: 24, quantity: 1, label: `Piece ${pieces.length + 1}` }])
  }

  const updatePiece = (index: number, field: keyof Piece, value: any) => {
    const newPieces = [...pieces]
    newPieces[index] = { ...newPieces[index], [field]: value }
    setPieces(newPieces)
  }

  const removePiece = (index: number) => {
    setPieces(pieces.filter((_, i) => i !== index))
  }

  const handleOptimize = async () => {
    if (sheets.length === 0 || pieces.length === 0) {
      alert('Please add at least one sheet and one piece')
      return
    }

    try {
      const result = await projectsApi.optimize({
        sheets,
        pieces,
        settings: {
          optimization_mode: optimizationMode,
          kerf_width: kerfWidth,
          min_usable_offcut: 6,
          grain_importance: 'medium',
        },
      })

      // Navigate to cutting plan view with results
      navigate(`/projects/${id || 'new'}/plan`, { state: { plan: result } })
    } catch (error) {
      console.error('Optimization failed:', error)
      alert('Optimization failed. Please check your inputs.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Project Details */}
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-white/20">
            <h2 className="text-3xl font-bold mb-6 text-white">Project Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  {...register('name', { required: true })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="My Woodworking Project"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={3}
                  placeholder="Project description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Unit System
                </label>
                <select
                  {...register('unit_system')}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="imperial" className="bg-slate-800">Imperial (inches)</option>
                  <option value="metric" className="bg-slate-800">Metric (millimeters)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sheets */}
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Sheet Materials</h2>
              <button
                type="button"
                onClick={addSheet}
                className="bg-amber-500 text-slate-900 px-6 py-3 rounded-lg hover:bg-amber-400 font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Add Sheet
              </button>
            </div>
            <div className="space-y-4">
              {sheets.map((sheet, index) => (
                <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Width ({getUnitLabel(unitSystem)})
                      </label>
                      <input
                        type="number"
                        step={getInputStep(unitSystem)}
                        value={toDisplayValue(sheet.width, unitSystem, 3)}
                        onChange={(e) => updateSheet(index, 'width', toInternalValue(parseFloat(e.target.value), unitSystem))}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Height ({getUnitLabel(unitSystem)})
                      </label>
                      <input
                        type="number"
                        step={getInputStep(unitSystem)}
                        value={toDisplayValue(sheet.height, unitSystem, 3)}
                        onChange={(e) => updateSheet(index, 'height', toInternalValue(parseFloat(e.target.value), unitSystem))}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Thickness ({getUnitLabel(unitSystem)})
                      </label>
                      <input
                        type="number"
                        step={getInputStep(unitSystem) / 2}
                        value={toDisplayValue(sheet.thickness || 0.75, unitSystem, 3)}
                        onChange={(e) => updateSheet(index, 'thickness', toInternalValue(parseFloat(e.target.value), unitSystem))}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={sheet.quantity}
                        onChange={(e) => updateSheet(index, 'quantity', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Has Grain
                      </label>
                      <div className="flex items-center h-10">
                        <input
                          type="checkbox"
                          checked={sheet.has_grain || false}
                          onChange={(e) => updateSheet(index, 'has_grain', e.target.checked)}
                          className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeSheet(index)}
                        className="text-red-400 hover:text-red-300 px-4 py-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pieces */}
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Pieces to Cut</h2>
              <button
                type="button"
                onClick={addPiece}
                className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg hover:bg-amber-400 font-semibold"
              >
                Add Piece
              </button>
            </div>
            <div className="space-y-4">
              {pieces.map((piece, index) => (
                <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Label
                      </label>
                      <input
                        type="text"
                        value={piece.label || ''}
                        onChange={(e) => updatePiece(index, 'label', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Width ({getUnitLabel(unitSystem)})
                      </label>
                      <input
                        type="number"
                        step={getInputStep(unitSystem)}
                        value={toDisplayValue(piece.width, unitSystem, 3)}
                        onChange={(e) => updatePiece(index, 'width', toInternalValue(parseFloat(e.target.value), unitSystem))}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Height ({getUnitLabel(unitSystem)})
                      </label>
                      <input
                        type="number"
                        step={getInputStep(unitSystem)}
                        value={toDisplayValue(piece.height, unitSystem, 3)}
                        onChange={(e) => updatePiece(index, 'height', toInternalValue(parseFloat(e.target.value), unitSystem))}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={piece.quantity}
                        onChange={(e) => updatePiece(index, 'quantity', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Grain Direction
                      </label>
                      <select
                        value={piece.grain_direction || 'none'}
                        onChange={(e) => updatePiece(index, 'grain_direction', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      >
                        <option value="none">No Preference</option>
                        <option value="parallel">Parallel (→)</option>
                        <option value="perpendicular">Perpendicular (↓)</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removePiece(index)}
                        className="text-red-400 hover:text-red-300 px-4 py-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optimization Settings */}
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-white/20">
            <h2 className="text-3xl font-bold mb-6 text-white">Optimization Settings</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Optimization Mode
                </label>
                <select
                  value={optimizationMode}
                  onChange={(e) => setOptimizationMode(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="waste">Minimize Waste</option>
                  <option value="cuts">Minimize Cuts</option>
                  <option value="sheets">Minimize Sheets</option>
                  <option value="grain">Optimize for Grain Direction</option>
                  <option value="balanced">Balanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Blade Kerf Width ({unitSystem === 'imperial' ? 'inches' : 'mm'})
                </label>
                <input
                  type="number"
                  step={unitSystem === 'imperial' ? '0.001' : '0.1'}
                  value={unitSystem === 'imperial' ? kerfWidth : (kerfWidth * 25.4).toFixed(2)}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    setKerfWidth(unitSystem === 'imperial' ? value : value / 25.4)
                  }}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20 border border-white/30 font-semibold"
            >
              Save Project
            </button>
            <button
              type="button"
              onClick={handleOptimize}
              className="bg-amber-500 text-slate-900 px-6 py-3 rounded-lg hover:bg-amber-400 font-semibold"
            >
              Calculate Cutting Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
