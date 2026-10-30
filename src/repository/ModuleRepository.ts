import supabase from "../config/supabase.js";
import type { Module, ModuleInput } from "../models/Module.js";

async function findAll(courseId?: number) {
    let query = supabase.from("modules").select("*");

    if (courseId !== undefined) {
        query = query.eq("course_id", courseId).order("position", { ascending: true });
    } else {
        query = query.order("id", { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data as Module[];
}

async function findById(id: number) {
    const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data as Module | null;
}

async function findNextPosition(courseId: number) {
    const { data, error } = await supabase
        .from("modules")
        .select("position")
        .eq("course_id", courseId)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return (data?.position ?? 0) + 1;
}

async function create(module: ModuleInput) {
    const { data, error } = await supabase
        .from("modules")
        .insert(module)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data as Module;
}

async function update(id: number, module: Partial<ModuleInput>) {
    const { data, error } = await supabase
        .from("modules")
        .update(module)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data as Module;
}

async function remove(id: number) {
    const { error } = await supabase
        .from("modules")
        .delete()
        .eq("id", id);

    if (error) {
        throw error;
    }
}

// TODO: move to CourseRepository / UserRepository once they exist
async function courseExists(courseId: number) {
    const { count, error } = await supabase
        .from("courses")
        .select("id", { count: "exact", head: true })
        .eq("id", courseId);

    if (error) {
        throw error;
    }

    return count === 1;
}

async function userExists(userId: number) {
    const { count, error } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("id", userId);

    if (error) {
        throw error;
    }

    return count === 1;
}

export default {
    findAll,
    findById,
    findNextPosition,
    create,
    update,
    remove,
    courseExists,
    userExists,
};
