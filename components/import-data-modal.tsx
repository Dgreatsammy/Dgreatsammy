"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileText, AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import type { Person } from "@/types/person"

interface ImportDataModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (people: Person[]) => void
}

type ImportResult = {
  success: Person[]
  errors: string[]
  duplicates: number
}

export default function ImportDataModal({ isOpen, onClose, onImport }: ImportDataModalProps) {
  const [activeTab, setActiveTab] = useState<string>("file")
  const [fileContent, setFileContent] = useState<string>("")
  const [manualContent, setManualContent] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")
  const [fileType, setFileType] = useState<string>("")
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = () => {
    setFileContent("")
    setManualContent("")
    setFileName("")
    setFileType("")
    setImportResult(null)
    setIsProcessing(false)
    setProgress(0)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setFileType(file.type)

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setFileContent(content)
    }
    reader.readAsText(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (!file) return

    setFileName(file.name)
    setFileType(file.type)

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setFileContent(content)
    }
    reader.readAsText(file)
  }

  const parseCSV = (content: string): Person[] => {
    const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "")

    return lines.map((line, index) => {
      const [name, birthdate, notes = ""] = line.split(",").map((item) => item.trim())

      // Validate date format
      const date = new Date(birthdate)
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format on line ${index + 1}: ${birthdate}`)
      }

      return {
        id: `import-${Date.now()}-${index}`,
        name,
        birthdate: date.toISOString(),
        notes,
      }
    })
  }

  const parseJSON = (content: string): Person[] => {
    try {
      const data = JSON.parse(content)

      if (!Array.isArray(data)) {
        throw new Error("JSON data must be an array of person objects")
      }

      return data.map((item, index) => {
        if (!item.name || !item.birthdate) {
          throw new Error(`Missing required fields on item ${index + 1}`)
        }

        // Validate date format
        const date = new Date(item.birthdate)
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date format on item ${index + 1}: ${item.birthdate}`)
        }

        return {
          id: item.id || `import-${Date.now()}-${index}`,
          name: item.name,
          birthdate: date.toISOString(),
          notes: item.notes || "",
        }
      })
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("Invalid JSON format")
      }
      throw error
    }
  }

  const parseTXT = (content: string): Person[] => {
    // Assuming TXT format is similar to CSV: name, birthdate, notes
    return parseCSV(content)
  }

  const validateAndProcessData = (content: string, type: string): ImportResult => {
    let parsedData: Person[] = []
    const errors: string[] = []

    try {
      if (type === "json" || fileName.endsWith(".json")) {
        parsedData = parseJSON(content)
      } else if (type === "csv" || fileName.endsWith(".csv")) {
        parsedData = parseCSV(content)
      } else {
        // Default to TXT format
        parsedData = parseTXT(content)
      }

      // Basic validation
      parsedData.forEach((person, index) => {
        if (!person.name) {
          errors.push(`Missing name on entry ${index + 1}`)
        }
        if (!person.birthdate) {
          errors.push(`Missing birthdate on entry ${index + 1}`)
        }
      })

      // Filter out invalid entries
      const validData = parsedData.filter((_, index) => !errors.some((error) => error.includes(`entry ${index + 1}`)))

      // Check for duplicates (simplified - just checking names)
      const uniqueNames = new Set<string>()
      const uniqueData: Person[] = []
      let duplicates = 0

      validData.forEach((person) => {
        if (!uniqueNames.has(person.name.toLowerCase())) {
          uniqueNames.add(person.name.toLowerCase())
          uniqueData.push(person)
        } else {
          duplicates++
        }
      })

      return {
        success: uniqueData,
        errors,
        duplicates,
      }
    } catch (error) {
      errors.push(`Error processing file: ${error instanceof Error ? error.message : String(error)}`)
      return {
        success: [],
        errors,
        duplicates: 0,
      }
    }
  }

  const handleImport = () => {
    setIsProcessing(true)
    setProgress(10)

    // Simulate processing time for better UX
    setTimeout(() => {
      try {
        const content = activeTab === "file" ? fileContent : manualContent
        const type = activeTab === "file" ? fileType : "txt"

        setProgress(50)

        const result = validateAndProcessData(content, type)
        setImportResult(result)

        setProgress(100)

        if (result.success.length > 0) {
          onImport(result.success)
        }
      } catch (error) {
        setImportResult({
          success: [],
          errors: [`Unexpected error: ${error instanceof Error ? error.message : String(error)}`],
          duplicates: 0,
        })
      } finally {
        setIsProcessing(false)
      }
    }, 800)
  }

  const getFileTypeFromName = (name: string): string => {
    if (name.endsWith(".json")) return "JSON"
    if (name.endsWith(".csv")) return "CSV"
    if (name.endsWith(".txt")) return "TXT"
    return "Unknown"
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-festive-purple">Import Birthday Data</DialogTitle>
          <DialogDescription>Import birthdays from a file or paste data directly.</DialogDescription>
        </DialogHeader>

        {!importResult ? (
          <Tabs defaultValue="file" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-festive-cream">
              <TabsTrigger value="file" className="data-[state=active]:bg-festive-pink data-[state=active]:text-white">
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="paste" className="data-[state=active]:bg-festive-pink data-[state=active]:text-white">
                <FileText className="mr-2 h-4 w-4" />
                Paste Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging ? "border-festive-pink bg-festive-cream" : "border-gray-200"
                } ${fileContent ? "bg-festive-cream" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.json,.txt"
                  className="hidden"
                />

                {fileContent ? (
                  <div className="space-y-2">
                    <FileText className="h-10 w-10 text-festive-pink mx-auto" />
                    <p className="font-medium text-gray-800">{fileName}</p>
                    <p className="text-sm text-gray-500">
                      {getFileTypeFromName(fileName)} file • {(fileContent.length / 1024).toFixed(1)} KB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFileContent("")
                        setFileName("")
                      }}
                      className="mt-2"
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-festive-pink mx-auto mb-4" />
                    <p className="text-gray-800 mb-2">Drag and drop your file here</p>
                    <p className="text-sm text-gray-500 mb-4">Supports CSV, JSON, and TXT formats</p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white hover:bg-festive-cream"
                    >
                      Select File
                    </Button>
                  </>
                )}
              </div>

              {fileContent && (
                <div className="border rounded-lg p-4 max-h-40 overflow-y-auto bg-white">
                  <p className="text-xs font-mono whitespace-pre-wrap text-gray-500">
                    {fileContent.slice(0, 500)}
                    {fileContent.length > 500 && "..."}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="paste" className="space-y-4">
              <p className="text-sm text-gray-500 mb-2">
                Paste your data in CSV format (name, birthdate, notes) or JSON format.
              </p>
              <Textarea
                placeholder="John Doe, 1990-01-15, Best friend
Jane Smith, 1985-05-22, Sister"
                className="font-mono text-sm min-h-[150px]"
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4 py-2">
            {importResult.success.length > 0 ? (
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Import Successful</AlertTitle>
                <AlertDescription className="text-green-700">
                  Successfully imported {importResult.success.length} birthdays
                  {importResult.duplicates > 0 && ` (${importResult.duplicates} duplicates skipped)`}.
                </AlertDescription>
              </Alert>
            ) : null}

            {importResult.errors.length > 0 && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Import Errors</AlertTitle>
                <AlertDescription className="text-red-700">
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                    {importResult.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {importResult.errors.length > 5 && <li>...and {importResult.errors.length - 5} more errors</li>}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="space-y-2 py-2">
            <p className="text-sm text-gray-500">Processing your data...</p>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <DialogFooter className="flex sm:justify-between gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          >
            {importResult ? "Close" : "Cancel"}
          </Button>

          {!importResult && (
            <Button
              onClick={handleImport}
              disabled={isProcessing || (activeTab === "file" ? !fileContent : !manualContent)}
              className="bg-gradient-to-r from-festive-purple to-festive-pink hover:opacity-90 text-white"
            >
              {isProcessing ? "Processing..." : "Import Data"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
