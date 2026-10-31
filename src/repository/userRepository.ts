import supabase from '../config/supabase.js';
import type { UserInput } from '../models/User.js';

async function findAll(){
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        throw error;
    }
    return data;
}

async function findById(id: string){
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

    if (error){
        throw error;
    }
    return data;
}

async function create(user: UserInput){
    const { data, error } = await supabase
        .from("users")
        .insert(user)
        .select()
        .single();

    if (error){
        throw error;
    }
    return data;
}

async function update(id: string, user: UserInput){
    const { data, error } = await supabase
        .from("users")
        .update({ ...user, updated_at: new Date().toISOString() })
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
        .from("users")
        .delete()
        .eq("id", id)
        .select()
        .single();

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
    remove
};
