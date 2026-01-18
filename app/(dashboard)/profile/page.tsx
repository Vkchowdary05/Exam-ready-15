'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuthStore } from '@/stores/auth-store'
import { currentUser, badges, samplePapers } from '@/lib/mock-data'
import {
  User,
  Mail,
  Building2,
  Upload,
  Settings,
  Bookmark,
  Award,
  Trash2,
  Camera,
  Github,
  Linkedin,
  Twitter,
  Bell,
  Shield,
  Download,
  Loader2,
  Check,
  Eye,
  Heart,
  Edit,
  Calendar
} from 'lucide-react'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(200, 'Bio must be 200 characters or less'),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function ProfileSettingsPage() {
  const { user, updateProfile } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('modern')

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser.name,
      bio: currentUser.bio || '',
      linkedinUrl: currentUser.socialLinks?.linkedin || '',
      githubUrl: currentUser.socialLinks?.github || '',
      twitterUrl: currentUser.socialLinks?.twitter || '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  })

  const onProfileSubmit = async (data: any) => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    updateProfile({
      name: data.name,
      bio: data.bio,
      socialLinks: {
        linkedin: data.linkedinUrl,
        github: data.githubUrl,
        twitter: data.twitterUrl,
      }
    })
    setIsSaving(false)
  }

  const onPasswordSubmit = async (data: any) => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    resetPassword()
    setIsSaving(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsUploading(false)
  }

  const myUploads = samplePapers.filter(p => p.uploadedBy === currentUser._id || p.uploadedBy === currentUser)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Profile & Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="uploads">My Uploads</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your profile details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold">
                          {currentUser.name.charAt(0)}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Camera className="w-6 h-6 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                        {isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Profile Picture</p>
                        <p className="text-sm text-muted-foreground">JPG, PNG. Max 2MB</p>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input {...registerProfile('name')} />
                      {profileErrors.name && (
                        <p className="text-sm text-destructive">{profileErrors.name.message}</p>
                      )}
                    </div>

                    {/* Email (readonly) */}
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={currentUser.email} disabled />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <textarea
                        {...registerProfile('bio')}
                        className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                        placeholder="Tell us about yourself..."
                      />
                      {profileErrors.bio && (
                        <p className="text-sm text-destructive">{profileErrors.bio.message}</p>
                      )}
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                      <Label>Social Links</Label>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Linkedin className="w-4 h-4 text-muted-foreground" />
                          <Input
                            {...registerProfile('linkedinUrl')}
                            placeholder="https://linkedin.com/in/..."
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Github className="w-4 h-4 text-muted-foreground" />
                          <Input
                            {...registerProfile('githubUrl')}
                            placeholder="https://github.com/..."
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Twitter className="w-4 h-4 text-muted-foreground" />
                          <Input
                            {...registerProfile('twitterUrl')}
                            placeholder="https://twitter.com/..."
                          />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" disabled={isSaving} className="w-full gap-2">
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Stats & Badges Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Credits</span>
                    <span className="font-bold text-xl text-foreground">{currentUser.credits}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Uploads</span>
                    <span className="font-bold text-xl text-foreground">{myUploads.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Likes</span>
                    <span className="font-bold text-xl text-foreground">142</span>
                  </div>
                </CardContent>
              </Card>

              {/* Badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {badges.slice(0, 6).map((badge, index) => {
                      const isUnlocked = index < currentUser.badges.length
                      return (
                        <div
                          key={badge.badgeId}
                          className={`p-3 rounded-lg border text-center ${isUnlocked
                              ? 'border-primary/30 bg-primary/5'
                              : 'border-border bg-muted/30 opacity-50'
                            }`}
                        >
                          <Award className={`w-8 h-8 mx-auto mb-2 ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                          <p className="text-xs font-medium">{badge.name}</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* My Uploads Tab */}
        <TabsContent value="uploads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Uploaded Papers</CardTitle>
              <CardDescription>Papers you've contributed to the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {myUploads.length === 0 ? (
                <div className="text-center py-12">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No uploads yet</h3>
                  <p className="text-muted-foreground mb-4">Start contributing by uploading your first paper</p>
                  <Button>Upload Paper</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myUploads.map((paper) => (
                    <div
                      key={paper._id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">{paper.subject}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary">{paper.examType}</Badge>
                          <span>•</span>
                          <span>{paper.semester} Sem</span>
                          <span>•</span>
                          <span>{paper.year}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {paper.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {paper.viewCount}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookmarks Tab */}
        <TabsContent value="bookmarks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Papers</CardTitle>
              <CardDescription>Papers you've bookmarked for later</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No bookmarks yet</h3>
                <p className="text-muted-foreground">Save papers to access them quickly later</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" {...registerPassword('currentPassword')} />
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-destructive">{String(passwordErrors.currentPassword.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" {...registerPassword('newPassword')} />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-destructive">{String(passwordErrors.newPassword.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" {...registerPassword('confirmPassword')} />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{String(passwordErrors.confirmPassword.message)}</p>
                  )}
                </div>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 'likes', label: 'New likes on my papers' },
                { id: 'comments', label: 'Comments on my papers' },
                { id: 'badges', label: 'Badge unlocks and achievements' },
                { id: 'weekly', label: 'Weekly digest' },
              ].map((pref) => (
                <div key={pref.id} className="flex items-center gap-3">
                  <Checkbox id={pref.id} defaultChecked />
                  <Label htmlFor={pref.id} className="cursor-pointer">{pref.label}</Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Theme */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Choose your preferred theme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'simple', name: 'Simple', color: 'bg-gray-500' },
                  { id: 'modern', name: 'Modern', color: 'bg-indigo-500' },
                  { id: 'tech', name: 'Tech', color: 'bg-cyan-500' },
                  { id: 'nerdy', name: 'Nerdy', color: 'bg-green-500' },
                ].map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${selectedTheme === theme.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                      }`}
                  >
                    <div className={`w-full h-16 rounded ${theme.color} mb-2`} />
                    <p className="text-sm font-medium">{theme.name}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox id="profile-visibility" defaultChecked />
                <Label htmlFor="profile-visibility" className="cursor-pointer">
                  Make my profile visible to other users
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox id="show-stats" defaultChecked />
                <Label htmlFor="show-stats" className="cursor-pointer">
                  Show my statistics on leaderboard
                </Label>
              </div>
              <div className="pt-4 border-t border-border space-y-2">
                <Button variant="outline" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Download My Data
                </Button>
                <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}