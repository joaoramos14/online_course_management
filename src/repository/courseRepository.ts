import supabase from '../config/supabase.js';
import type { CourseInput } from '../models/Course.js';

async function findAll(){
    const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("title", { ascending: true });

    if (error) {
        throw error;
    }
    return data;
}

async function findById(id: string){
    const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

    if (error){
        throw error;
    }
    return data;
}

async function create(course: CourseInput){
    const { data, error } = await supabase
        .from("courses")
        .insert(course)
        .select()
        .single();

    if (error){
        throw error;
    }
    return data;
}

async function update(id: string, course: CourseInput){
    const { data, error } = await supabase
        .from("courses")
        .update({ ...course, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

    if (error){
        throw error;
    }
    return data;
}

async function remove(id: string){
    const { data, error } = await supabase
        .from("courses")
        .delete()
        .eq("id", id)
        .single();

    if (error){
        throw error;
    }
    return data;
}

async function searchByKeyword(keyword: string){
    const { data, error } = await supabase
        .from("courses")
        .select("*")
        .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
        .order("title", { ascending: true });

    if (error){
        throw error;
    }
    return data;
}

export default {
    findAll,
    findById,
    create,
    update,
    remove,
    searchByKeyword
};