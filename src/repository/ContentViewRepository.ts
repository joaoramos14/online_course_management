import supabase from "../config/supabase.js";
import type { ContentView } from "../models/ContentView.js";

async function findByContent(contentId: number) {
    const { data, error } = await supabase
        .from("content_views")
        .select("id, user_id, content_id, viewed_at, users(name, email)")
        .eq("content_id", contentId)
        .order("viewed_at", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

async function findOne(contentId: number, userId: number) {
    const { data, error } = await supabase
        .from("content_views")
        .select("*")
        .eq("content_id", contentId)
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data as ContentView | null;
}

async function create(contentId: number, userId: number) {
    const { data, error } = await supabase
        .from("content_views")
        .insert({ content_id: contentId, user_id: userId })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data as ContentView;
}

async function remove(contentId: number, userId: number) {
    const { error } = await supabase
        .from("content_views")
        .delete()
        .eq("content_id", contentId)
        .eq("user_id", userId);

    if (error) {
        throw error;
    }
}

export default {
    findByContent,
    findOne,
    create,
    remove,
};
