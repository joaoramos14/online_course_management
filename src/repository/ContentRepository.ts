import supabase from "../config/supabase.js";
import type { Content, ContentInput } from "../models/Content.js";

async function findAll(moduleId?: number) {
    let query = supabase.from("contents").select("*");

    if (moduleId !== undefined) {
        query = query.eq("module_id", moduleId).order("position", { ascending: true });
    } else {
        query = query.order("id", { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data as Content[];
}

async function findById(id: number) {
    const { data, error } = await supabase
        .from("contents")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data as Content | null;
}

async function findNextPosition(moduleId: number) {
    const { data, error } = await supabase
        .from("contents")
        .select("position")
        .eq("module_id", moduleId)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return (data?.position ?? 0) + 1;
}

async function create(content: ContentInput) {
    const { data, error } = await supabase
        .from("contents")
        .insert(content)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data as Content;
}

async function update(id: number, content: Partial<ContentInput>) {
    const { data, error } = await supabase
        .from("contents")
        .update(content)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data as Content;
}

async function remove(id: number) {
    const { error } = await supabase
        .from("contents")
        .delete()
        .eq("id", id);

    if (error) {
        throw error;
    }
}

export default {
    findAll,
    findById,
    findNextPosition,
    create,
    update,
    remove,
};
