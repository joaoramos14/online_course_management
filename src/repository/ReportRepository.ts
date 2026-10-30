import supabase from "../config/supabase.js";

// Each report is a database view created by the migration
// "create-report-views" (same SQL as the files database/0X_*.sql).

// SQL 01
async function findUsersWithMostCourses() {
    const { data, error } = await supabase
        .from("report_users_most_courses")
        .select("*")
        .order("total_courses", { ascending: false })
        .order("name", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

// SQL 02
async function findCourseWithMostContents() {
    const { data, error } = await supabase
        .from("report_course_most_contents")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

// SQL 03
async function findCoursesWithTotals() {
    const { data, error } = await supabase
        .from("report_courses_totals")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

// SQL 04
async function findContentsWithCourseName() {
    const { data, error } = await supabase
        .from("report_contents_with_course")
        .select("*");

    if (error) {
        throw error;
    }

    return data;
}

// SQL 05
async function findContentViewers(contentId: number) {
    const { data, error } = await supabase
        .from("report_content_viewers")
        .select("*")
        .eq("content_id", contentId)
        .order("viewed_at", { ascending: true })
        .order("name", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

export default {
    findUsersWithMostCourses,
    findCourseWithMostContents,
    findCoursesWithTotals,
    findContentsWithCourseName,
    findContentViewers,
};
