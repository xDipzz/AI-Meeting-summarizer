"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Edit3,
  Save,
  RotateCcw,
  Mail,
  Send,
  Plus,
  X,
  Copy,
  Download,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [transcript, setTranscript] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState("")
  const [editedSummary, setEditedSummary] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState("")

  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState<string[]>([])
  const [currentEmail, setCurrentEmail] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState("")

  const { toast } = useToast()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const files = Array.from(e.dataTransfer.files)
      const file = files[0]

      if (file) {
        // Allow text files, even if MIME type is not detected correctly
        const validExtensions = ['.txt', '.text']
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
        
        if (file.type === "text/plain" || validExtensions.includes(fileExtension) || file.type === "") {
          const reader = new FileReader()
          reader.onload = (e) => {
            const content = e.target?.result as string
            setTranscript(content)
            toast({
              title: "File uploaded successfully",
              description: `Loaded ${content.length} characters from ${file.name}`,
            })
          }
          reader.onerror = () => {
            toast({
              title: "File read error",
              description: "Could not read the file. Please try again.",
              variant: "destructive",
            })
          }
          reader.readAsText(file)
        } else {
          toast({
            title: "Invalid file type",
            description: "Please upload a .txt file",
            variant: "destructive",
          })
        }
      }
    },
    [toast],
  )

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Allow text files, even if MIME type is not detected correctly
      const validExtensions = ['.txt', '.text']
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
      
      if (file.type === "text/plain" || validExtensions.includes(fileExtension) || file.type === "") {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          setTranscript(content)
          toast({
            title: "File uploaded successfully",
            description: `Loaded ${content.length} characters from ${file.name}`,
          })
        }
        reader.onerror = () => {
          toast({
            title: "File read error",
            description: "Could not read the file. Please try again.",
            variant: "destructive",
          })
        }
        reader.readAsText(file)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a .txt file",
          variant: "destructive",
        })
      }
    }
  }

  const handleGenerateSummary = async () => {
    if (!transcript.trim()) return

    setIsLoading(true)
    setError("")
    setSummary("")
    setEditedSummary("")
    setIsEditing(false)
    setShowEmailForm(false)
    setEmailSuccess("")

    try {
      console.log("[v0] Sending summarization request")

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: transcript.trim(),
          customPrompt: customPrompt.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate summary")
      }

      console.log("[v0] Summary received successfully")
      setSummary(data.summary)
      setEditedSummary(data.summary)
      setEmailSubject("Meeting Summary - " + new Date().toLocaleDateString())

      toast({
        title: "Summary generated successfully",
        description: "Your meeting summary is ready for review and sharing",
      })
    } catch (err) {
      console.error("[v0] Error generating summary:", err)
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Failed to generate summary",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSummary = () => {
    setIsEditing(true)
  }

  const handleSaveSummary = () => {
    setSummary(editedSummary)
    setIsEditing(false)
    console.log("[v0] Summary saved with edits")
    toast({
      title: "Summary saved",
      description: "Your edits have been saved successfully",
    })
  }

  const handleResetSummary = () => {
    setEditedSummary(summary)
    setIsEditing(false)
    console.log("[v0] Summary reset to original")
  }

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      toast({
        title: "Copied to clipboard",
        description: "Summary has been copied to your clipboard",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy summary to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleDownloadSummary = () => {
    const blob = new Blob([summary], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `meeting-summary-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Download started",
      description: "Your summary is being downloaded",
    })
  }

  const handleAddEmail = () => {
    const email = currentEmail.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email) return

    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email address",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    if (emailRecipients.includes(email)) {
      toast({
        title: "Email already added",
        description: "This email address is already in the recipient list",
        variant: "destructive",
      })
      return
    }

    setEmailRecipients([...emailRecipients, email])
    setCurrentEmail("")
    toast({
      title: "Recipient added",
      description: `Added ${email} to recipient list`,
    })
  }

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmailRecipients(emailRecipients.filter((email) => email !== emailToRemove))
    toast({
      title: "Recipient removed",
      description: `Removed ${emailToRemove} from recipient list`,
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddEmail()
    }
  }

  const handleSendEmail = async () => {
    if (emailRecipients.length === 0 || !summary) return

    setIsSendingEmail(true)
    setError("")
    setEmailSuccess("")

    try {
      console.log("[v0] Sending email to recipients")

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: emailRecipients,
          subject: emailSubject || "Meeting Summary",
          summary: summary,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email")
      }

      console.log("[v0] Email sent successfully")
      setEmailSuccess(data.message)
      setShowEmailForm(false)
      setEmailRecipients([])
      setCurrentEmail("")

      toast({
        title: "Email sent successfully",
        description: data.message,
      })
    } catch (err) {
      console.error("[v0] Error sending email:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to send email"
      setError(errorMessage)
      toast({
        title: "Failed to send email",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const getProgressValue = () => {
    if (!transcript) return 0
    if (transcript && !summary) return 25
    if (summary && !showEmailForm) return 75
    if (showEmailForm) return 100
    return 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">AI Meeting Summarizer</h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Transform your meeting transcripts into structured, actionable summaries with AI-powered intelligence
          </p>

          <div className="max-w-md mx-auto mt-6">
            <div className="flex justify-between text-sm text-slate-500 mb-2">
              <span>Progress</span>
              <span>{getProgressValue()}%</span>
            </div>
            <Progress value={getProgressValue()} className="h-2" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Upload Section */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Meeting Transcript
              </CardTitle>
              <CardDescription>Upload a text file or paste your meeting transcript directly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload with improved drag and drop */}
              <div
                className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">Click to upload a text file</span>
                  <span className="text-slate-500 ml-1">or drag and drop</span>
                </Label>
                <input 
                  id="file-upload" 
                  type="file" 
                  accept=".txt,.text,text/plain" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <p className="text-sm text-slate-400 mt-1">TXT files only • Max 10MB</p>
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <Label htmlFor="transcript">Or paste your transcript here</Label>
                <Textarea
                  id="transcript"
                  placeholder="Paste your meeting transcript, call notes, or any text you'd like to summarize..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <div className="flex justify-between text-sm text-slate-500">
                  <span>{transcript.length} characters</span>
                  {transcript.length > 0 && <span className="text-green-600">✓ Ready to summarize</span>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Prompt Section */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Custom Instructions
              </CardTitle>
              <CardDescription>Tell the AI how you want your summary formatted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="custom-prompt">Summary Instructions (Optional)</Label>
                <Textarea
                  id="custom-prompt"
                  placeholder="e.g., 'Summarize in bullet points for executives' or 'Highlight only action items and deadlines'"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="mt-4">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Quick suggestions:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    "Summarize in bullet points for executives",
                    "Highlight only action items and deadlines",
                    "Create a detailed technical summary",
                    "Focus on key decisions made",
                    "Extract next steps and responsibilities",
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomPrompt(suggestion)}
                      className="text-xs hover:bg-blue-50 hover:border-blue-300"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleGenerateSummary}
              disabled={!transcript.trim() || isLoading}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating Summary...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Summary
                </>
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {emailSuccess && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">{emailSuccess}</AlertDescription>
            </Alert>
          )}

          {summary && (
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <CardTitle>Generated Summary</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {!isEditing ? (
                      <>
                        <Button onClick={handleCopySummary} variant="outline" size="sm">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button onClick={handleDownloadSummary} variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button onClick={handleEditSummary} variant="outline" size="sm">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => setShowEmailForm(!showEmailForm)}
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={handleSaveSummary} size="sm" className="bg-green-600 hover:bg-green-700">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={handleResetSummary} variant="outline" size="sm">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {isEditing ? "Edit your summary as needed" : "Your AI-generated meeting summary is ready"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="edit-summary">Edit Summary</Label>
                    <Textarea
                      id="edit-summary"
                      value={editedSummary}
                      onChange={(e) => setEditedSummary(e.target.value)}
                      className="min-h-[300px] resize-none font-mono text-sm"
                      placeholder="Edit your summary here..."
                    />
                    <p className="text-sm text-slate-500">{editedSummary.length} characters</p>
                  </div>
                ) : (
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border">
                      {summary}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {showEmailForm && summary && (
            <Card className="border-blue-200 dark:border-blue-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Share Summary via Email
                </CardTitle>
                <CardDescription>Send your meeting summary to team members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email Subject */}
                <div className="space-y-2">
                  <Label htmlFor="email-subject">Email Subject</Label>
                  <Input
                    id="email-subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Meeting Summary - [Date]"
                  />
                </div>

                {/* Email Recipients */}
                <div className="space-y-2">
                  <Label htmlFor="email-input">Recipients</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email-input"
                      type="email"
                      value={currentEmail}
                      onChange={(e) => setCurrentEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter email address"
                      className="flex-1"
                    />
                    <Button onClick={handleAddEmail} variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Email Tags */}
                  {emailRecipients.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {emailRecipients.map((email) => (
                        <Badge key={email} variant="secondary" className="flex items-center gap-1">
                          {email}
                          <button onClick={() => handleRemoveEmail(email)} className="ml-1 hover:text-red-600">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {emailRecipients.length > 0 && (
                    <p className="text-sm text-slate-500">
                      {emailRecipients.length} recipient{emailRecipients.length > 1 ? "s" : ""} added
                    </p>
                  )}
                </div>

                {/* Send Button */}
                <div className="flex justify-end gap-2">
                  <Button onClick={() => setShowEmailForm(false)} variant="outline">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendEmail}
                    disabled={emailRecipients.length === 0 || isSendingEmail}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSendingEmail ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Email ({emailRecipients.length})
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
