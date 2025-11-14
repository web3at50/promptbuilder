'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Eye, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { AdminNav } from '@/components/admin/AdminNav';
import { toast } from 'sonner';

interface PendingPrompt {
  id: string;
  title: string;
  description: string | null;
  content: string;
  category: string | null;
  tags: string[];
  moderation_status: string;
  moderation_scores: Record<string, number> | null;
  moderation_flagged_for: string[];
  moderation_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  published_at: string;
  updated_at: string;
}

interface StatusCounts {
  pending: number;
  auto_approved: number;
  approved: number;
  rejected: number;
}

export default function AdminPendingPromptsPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<PendingPrompt[]>([]);
  const [counts, setCounts] = useState<StatusCounts>({
    pending: 0,
    auto_approved: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedPrompt, setSelectedPrompt] = useState<PendingPrompt | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPrompts = useCallback(
    async (status: string = 'pending') => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/pending-prompts?status=${status}`);
        if (response.status === 403) {
          router.push('/');
          return;
        }
        const data = await response.json();
        setPrompts(data.prompts || []);
        setCounts(data.counts || {
          pending: 0,
          auto_approved: 0,
          approved: 0,
          rejected: 0,
        });
      } catch (error) {
        console.error('Error fetching prompts:', error);
        toast.error('Failed to load prompts');
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    fetchPrompts(activeTab);
  }, [activeTab, fetchPrompts]);

  const handleApprove = async (promptId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/pending-prompts/${promptId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to approve');

      toast.success('Prompt approved successfully!');
      fetchPrompts(activeTab);
    } catch (error) {
      console.error('Error approving prompt:', error);
      toast.error('Failed to approve prompt');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPrompt) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/pending-prompts/${selectedPrompt.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: rejectNotes }),
      });

      if (!response.ok) throw new Error('Failed to reject');

      toast.success('Prompt rejected successfully');
      setShowRejectDialog(false);
      setRejectNotes('');
      setSelectedPrompt(null);
      fetchPrompts(activeTab);
    } catch (error) {
      console.error('Error rejecting prompt:', error);
      toast.error('Failed to reject prompt');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending Review
          </Badge>
        );
      case 'auto_approved':
        return (
          <Badge variant="default" className="gap-1 bg-green-500">
            <CheckCircle className="h-3 w-3" />
            Auto-Approved
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="default" className="gap-1 bg-blue-500">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getModerationScoreBadge = (score: number) => {
    if (score >= 0.8) {
      return <Badge variant="destructive">{(score * 100).toFixed(0)}%</Badge>;
    } else if (score >= 0.3) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-500">{(score * 100).toFixed(0)}%</Badge>;
    } else {
      return <Badge variant="outline" className="border-green-500 text-green-500">{(score * 100).toFixed(0)}%</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AdminNav />

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Content Moderation</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Review and manage community prompt submissions
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl h-auto">
            <TabsTrigger value="pending" className="gap-2 text-xs sm:text-sm py-2 sm:py-1.5">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden xs:inline">Pending</span>
              {counts.pending > 0 && (
                <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                  {counts.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="auto_approved" className="gap-1 text-xs sm:text-sm py-2 sm:py-1.5">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Auto</span>
              <span className="text-xs text-muted-foreground">({counts.auto_approved})</span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-1 text-xs sm:text-sm py-2 sm:py-1.5">
              <span className="hidden xs:inline">Approved</span>
              <span className="xs:hidden">✓</span>
              <span className="text-xs text-muted-foreground">({counts.approved})</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-1 text-xs sm:text-sm py-2 sm:py-1.5">
              <XCircle className="h-4 w-4" />
              <span className="hidden xs:inline">Rejected</span>
              <span className="text-xs text-muted-foreground">({counts.rejected})</span>
            </TabsTrigger>
          </TabsList>

          {['pending', 'auto_approved', 'approved', 'rejected'].map((status) => (
            <TabsContent key={status} value={status}>
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{status.replace('_', ' ')} Prompts</CardTitle>
                  <CardDescription>
                    {status === 'pending' && 'Prompts flagged for manual review'}
                    {status === 'auto_approved' && 'Prompts automatically approved by AI moderation'}
                    {status === 'approved' && 'Prompts manually approved by admin'}
                    {status === 'rejected' && 'Prompts rejected by admin'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : prompts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No {status} prompts found
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Submitted</TableHead>
                              <TableHead>Flagged For</TableHead>
                              <TableHead>Max Score</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {prompts.map((prompt) => {
                              const maxScore = prompt.moderation_scores
                                ? Math.max(...Object.values(prompt.moderation_scores as Record<string, number>))
                                : 0;

                              return (
                                <TableRow key={prompt.id}>
                                  <TableCell className="font-medium max-w-xs truncate">
                                    {prompt.title}
                                  </TableCell>
                                  <TableCell>
                                    {new Date(prompt.published_at).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    {prompt.moderation_flagged_for && prompt.moderation_flagged_for.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {prompt.moderation_flagged_for.map((cat) => (
                                          <Badge key={cat} variant="outline" className="text-xs">
                                            {cat.replace('/', ' ')}
                                          </Badge>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-sm">None</span>
                                    )}
                                  </TableCell>
                                  <TableCell>{getModerationScoreBadge(maxScore)}</TableCell>
                                  <TableCell>{getStatusBadge(prompt.moderation_status)}</TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedPrompt(prompt)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      {prompt.moderation_status === 'pending' && (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleApprove(prompt.id)}
                                            disabled={actionLoading}
                                            className="text-green-600 hover:text-green-700"
                                          >
                                            <CheckCircle className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              setSelectedPrompt(prompt);
                                              setShowRejectDialog(true);
                                            }}
                                            disabled={actionLoading}
                                            className="text-red-600 hover:text-red-700"
                                          >
                                            <XCircle className="h-4 w-4" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-3">
                        {prompts.map((prompt) => {
                          const maxScore = prompt.moderation_scores
                            ? Math.max(...Object.values(prompt.moderation_scores as Record<string, number>))
                            : 0;

                          return (
                            <Card key={prompt.id} className="overflow-hidden">
                              <CardContent className="p-4 space-y-3">
                                {/* Title & Status */}
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-semibold text-base leading-snug flex-1 line-clamp-2">
                                    {prompt.title}
                                  </h3>
                                  {getStatusBadge(prompt.moderation_status)}
                                </div>

                                {/* Date & Score */}
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span>{new Date(prompt.published_at).toLocaleDateString()}</span>
                                  <span>•</span>
                                  <div className="flex items-center gap-1.5">
                                    <span>Score:</span>
                                    {getModerationScoreBadge(maxScore)}
                                  </div>
                                </div>

                                {/* Flagged For */}
                                {prompt.moderation_flagged_for && prompt.moderation_flagged_for.length > 0 && (
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1.5">Flagged for:</div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {prompt.moderation_flagged_for.map((cat) => (
                                        <Badge key={cat} variant="outline" className="text-xs">
                                          {cat.replace('/', ' ')}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-2 border-t">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedPrompt(prompt)}
                                    className="flex-1 gap-2 min-h-[44px]"
                                  >
                                    <Eye className="h-4 w-4" />
                                    View
                                  </Button>
                                  {prompt.moderation_status === 'pending' && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleApprove(prompt.id)}
                                        disabled={actionLoading}
                                        className="flex-1 gap-2 min-h-[44px] text-green-600 hover:text-green-700 border-green-600"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                        Approve
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedPrompt(prompt);
                                          setShowRejectDialog(true);
                                        }}
                                        disabled={actionLoading}
                                        className="flex-1 gap-2 min-h-[44px] text-red-600 hover:text-red-700 border-red-600"
                                      >
                                        <XCircle className="h-4 w-4" />
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* View Prompt Dialog */}
      <Dialog open={!!selectedPrompt && !showRejectDialog} onOpenChange={(open) => !open && setSelectedPrompt(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPrompt?.title}</DialogTitle>
            <DialogDescription>
              Submitted on {selectedPrompt && new Date(selectedPrompt.published_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Description */}
            {selectedPrompt?.description && (
              <div>
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedPrompt.description}</p>
              </div>
            )}

            {/* Content */}
            <div>
              <Label>Content</Label>
              <div className="mt-2 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                {selectedPrompt?.content}
              </div>
            </div>

            {/* Tags & Category */}
            <div className="flex gap-4">
              {selectedPrompt?.tags && selectedPrompt.tags.length > 0 && (
                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPrompt.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedPrompt?.category && (
                <div>
                  <Label>Category</Label>
                  <Badge variant="outline" className="mt-1">
                    {selectedPrompt.category}
                  </Badge>
                </div>
              )}
            </div>

            {/* Moderation Scores */}
            {selectedPrompt?.moderation_scores && (
              <div>
                <Label>Moderation Scores</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(selectedPrompt.moderation_scores as Record<string, number>).map(
                    ([category, score]) => (
                      <div key={category} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm capitalize">{category.replace('/', ' ')}</span>
                        {getModerationScoreBadge(score as number)}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Rejection Notes */}
            {selectedPrompt?.moderation_notes && (
              <div>
                <Label>Rejection Reason</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedPrompt.moderation_notes}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            {selectedPrompt?.moderation_status === 'pending' && (
              <>
                <Button variant="outline" onClick={() => setSelectedPrompt(null)}>
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    handleApprove(selectedPrompt.id);
                    setSelectedPrompt(null);
                  }}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowRejectDialog(true);
                  }}
                  disabled={actionLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Prompt</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this prompt? You can optionally provide a reason.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-notes">Reason (Optional)</Label>
              <Textarea
                id="reject-notes"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false);
              setRejectNotes('');
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
