import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Template, ContentBlock } from '@/types';

interface TemplateState {
  templates: Template[];
  contentBlocks: ContentBlock[];
  isLoading: boolean;
  error: string | null;

  // Templates
  fetchTemplates: () => Promise<void>;
  createTemplate: (data: Partial<Template>) => Promise<string | null>;
  updateTemplate: (id: string, data: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  incrementUsage: (id: string) => Promise<void>;

  // Content Blocks
  fetchContentBlocks: () => Promise<void>;
  createContentBlock: (data: Partial<ContentBlock>) => Promise<string | null>;
  updateContentBlock: (id: string, data: Partial<ContentBlock>) => Promise<void>;
  deleteContentBlock: (id: string) => Promise<void>;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: [],
  contentBlocks: [],
  isLoading: false,
  error: null,

  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false });

    set({
      templates: (data as Template[]) ?? [],
      isLoading: false,
      error: error?.message ?? null,
    });
  },

  createTemplate: async (data) => {
    const { data: template, error } = await supabase
      .from('templates')
      .insert(data)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return null;
    }
    await get().fetchTemplates();
    return (template as Template).id;
  },

  updateTemplate: async (id, data) => {
    const { error } = await supabase.from('templates').update(data).eq('id', id);
    if (!error) await get().fetchTemplates();
    set({ error: error?.message ?? null });
  },

  deleteTemplate: async (id) => {
    await supabase.from('templates').update({ is_active: false }).eq('id', id);
    await get().fetchTemplates();
  },

  incrementUsage: async (id) => {
    await supabase.rpc('increment_template_usage', { template_id: id });
  },

  // Content Blocks
  fetchContentBlocks: async () => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase
      .from('content_blocks')
      .select('*')
      .order('category')
      .order('title');

    set({
      contentBlocks: (data as ContentBlock[]) ?? [],
      isLoading: false,
      error: error?.message ?? null,
    });
  },

  createContentBlock: async (data) => {
    const { data: block, error } = await supabase
      .from('content_blocks')
      .insert(data)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return null;
    }
    await get().fetchContentBlocks();
    return (block as ContentBlock).id;
  },

  updateContentBlock: async (id, data) => {
    const { error } = await supabase.from('content_blocks').update(data).eq('id', id);
    if (!error) await get().fetchContentBlocks();
    set({ error: error?.message ?? null });
  },

  deleteContentBlock: async (id) => {
    await supabase.from('content_blocks').delete().eq('id', id);
    set({ contentBlocks: get().contentBlocks.filter((b) => b.id !== id) });
  },
}));
