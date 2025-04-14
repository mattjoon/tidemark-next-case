'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from '@/utils/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from "lucide-react";
import { useState, useEffect } from 'react';

const formSchema = z.object({
  content: z.string().min(1, {
    message: "Note cannot be empty.",
  }),
});

interface Note {
  id: string;
  company_id: string;
  user_id: string;
  user_email: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NoteFormProps {
  companyId: string;
  onSuccess?: () => void;
}

export function NoteForm({ companyId, onSuccess }: NoteFormProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }
      setCurrentUser(user ? { id: user.id, email: user.email || '' } : null);
    };
    fetchUser();
  }, [supabase.auth]);

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ['notes', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_notes')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error);
        throw error;
      }
      return data || [];
    },
  });

  // Add delete handler
  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('company_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', currentUser?.id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['notes', companyId] });
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setError(null);
      
      if (!currentUser) {
        setError('You must be logged in to add notes');
        return;
      }

      console.log('Saving note with data:', {
        company_id: companyId,
        user_id: currentUser.id,
        user_email: currentUser.email,
        content: values.content,
      });

      const { data, error } = await supabase
        .from('company_notes')
        .insert({
          company_id: companyId,
          user_id: currentUser.id,
          user_email: currentUser.email,
          content: values.content,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        setError(error.message);
        return;
      }

      console.log('Note saved successfully:', data);

      // Reset form and refresh notes
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['notes', companyId] });
      onSuccess?.();
    } catch (error) {
      console.error('Error saving note:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while saving the note');
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Add a note..."
                    className="min-h-[100px] focus-visible:ring-0 focus-visible:ring-offset-0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <Button 
            type="submit" 
            className="w-full"
            disabled={!currentUser}
          >
            Save Note
          </Button>
        </form>
      </Form>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes yet. Add one above!</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="p-4 rounded-lg border">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-medium">{note.user_email}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </div>
                {currentUser?.id === note.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNote(note.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="whitespace-pre-wrap">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 