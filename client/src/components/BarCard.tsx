import { useState } from "react";
import type { BarWithUser } from "@shared/schema";
import { Heart, MessageCircle, Share2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { formatTimestamp } from "@/lib/formatDate";
import { useBars } from "@/context/BarContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface BarCardProps {
  bar: BarWithUser;
}

const CATEGORIES = ["Funny", "Serious", "Wordplay", "Storytelling", "Battle", "Freestyle"];

export default function BarCard({ bar }: BarCardProps) {
  const { currentUser } = useBars();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editContent, setEditContent] = useState(bar.content);
  const [editExplanation, setEditExplanation] = useState(bar.explanation || "");
  const [editCategory, setEditCategory] = useState(bar.category);
  const [editTags, setEditTags] = useState(bar.tags?.join(", ") || "");

  const isOwner = currentUser?.id === bar.user.id;

  const updateMutation = useMutation({
    mutationFn: () => api.updateBar(bar.id, {
      content: editContent,
      explanation: editExplanation || undefined,
      category: editCategory,
      tags: editTags.split(",").map(t => t.trim()).filter(Boolean),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bars'] });
      toast({ title: "Bar updated" });
      setIsEditOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteBar(bar.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bars'] });
      toast({ title: "Bar deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createMarkup = (html: string) => {
    return { __html: html };
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-white/10">
                <AvatarImage src={bar.user.avatarUrl || undefined} alt={bar.user.username} />
                <AvatarFallback>{bar.user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm hover:text-primary cursor-pointer" data-testid={`text-author-${bar.id}`}>
                    @{bar.user.username}
                  </span>
                  {bar.user.membershipTier !== "free" && (
                    <span className="text-[10px] text-primary">✓</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground" data-testid={`text-timestamp-${bar.id}`}>
                  {formatTimestamp(bar.createdAt)}
                </span>
              </div>
            </div>
            {isOwner ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" data-testid={`button-more-${bar.id}`}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)} data-testid={`button-edit-${bar.id}`}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-destructive" data-testid={`button-delete-${bar.id}`}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" data-testid={`button-more-${bar.id}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="relative pl-4 border-l-2 border-primary/50 py-1">
              <p 
                className="font-mono text-lg md:text-xl leading-relaxed whitespace-pre-wrap text-foreground/90 [&>b]:text-primary [&>b]:font-black [&>i]:text-primary/80 [&>u]:decoration-primary [&>u]:decoration-2 [&>u]:underline-offset-4"
                data-testid={`text-content-${bar.id}`}
                dangerouslySetInnerHTML={createMarkup(bar.content)}
              />
            </div>
            
            {bar.explanation && (
              <div className="bg-secondary/30 p-3 rounded-md text-sm text-muted-foreground italic" data-testid={`text-explanation-${bar.id}`}>
                <span className="font-bold text-primary/80 not-italic mr-2">Entendre:</span>
                {bar.explanation}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="outline" className="border-primary/20 text-primary/80 hover:bg-primary/10" data-testid={`badge-category-${bar.id}`}>
                {bar.category}
              </Badge>
              {bar.tags && bar.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs text-muted-foreground" data-testid={`badge-tag-${tag}-${bar.id}`}>
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>

          <CardFooter className="border-t border-white/5 py-3">
            <div className="flex w-full items-center justify-between text-muted-foreground">
              <Button variant="ghost" size="sm" className="gap-2 hover:text-red-500 hover:bg-red-500/10 transition-colors" data-testid={`button-like-${bar.id}`}>
                <Heart className="h-4 w-4" />
                <span className="text-xs">0</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="gap-2 hover:text-blue-400 hover:bg-blue-400/10 transition-colors" data-testid={`button-comment-${bar.id}`}>
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">0</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="gap-2 hover:text-primary hover:bg-primary/10 transition-colors" data-testid={`button-share-${bar.id}`}>
                <Share2 className="h-4 w-4" />
                <span className="text-xs">Share</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Bar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-content">Your Bar</Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px] font-mono"
                data-testid="input-edit-content"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-explanation">Explanation (optional)</Label>
              <Textarea
                id="edit-explanation"
                value={editExplanation}
                onChange={(e) => setEditExplanation(e.target.value)}
                placeholder="Explain the wordplay or meaning..."
                data-testid="input-edit-explanation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger data-testid="select-edit-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags (comma separated)</Label>
              <Input
                id="edit-tags"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="hiphop, bars, fire"
                data-testid="input-edit-tags"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => updateMutation.mutate()} 
              disabled={updateMutation.isPending || !editContent.trim()}
              data-testid="button-save-edit"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this bar?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your bar will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
