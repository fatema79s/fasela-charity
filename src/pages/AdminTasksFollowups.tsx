import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import TaskCompletionDialog from "@/components/admin/TaskCompletionDialog";
import { useNavigate } from "react-router-dom";

interface Task {
  id: string;
  case_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  completed_at: string | null;
  completion_notes: string | null;
  cases: {
    id: string;
    title: string;
    title_ar: string;
  };
}

interface Followup {
  id: string;
  case_id: string;
  followup_date: string;
  followup_type: string;
  notes: string;
  next_action: string | null;
  created_at: string;
  cases: {
    id: string;
    title: string;
    title_ar: string;
  };
}

const priorityColors = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
};

const priorityLabels = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
};

const statusColors = {
  pending: "bg-gray-500",
  in_progress: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const statusLabels = {
  pending: "معلقة",
  in_progress: "جارية",
  completed: "مكتملة",
  cancelled: "ملغاة",
};

const AdminTasksFollowups = () => {
  const navigate = useNavigate();
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["all-case-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_tasks")
        .select(`
          *,
          cases (
            id,
            title,
            title_ar
          )
        `)
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data as Task[];
    },
  });

  const { data: followups, isLoading: followupsLoading } = useQuery({
    queryKey: ["all-case-followups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_followups")
        .select(`
          *,
          cases (
            id,
            title,
            title_ar
          )
        `)
        .order("followup_date", { ascending: false });

      if (error) throw error;
      return data as Followup[];
    },
  });

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === "completed" || status === "cancelled") return false;
    return new Date(dueDate) < new Date();
  };

  const handleCompleteTask = (task: Task) => {
    setSelectedTask(task);
    setCompletionDialogOpen(true);
  };

  const activeTasks = tasks?.filter(
    (task) => task.status !== "completed" && task.status !== "cancelled"
  );

  const completedTasks = tasks?.filter((task) => task.status === "completed");

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            المهام والمتابعات
          </h1>
          <p className="text-muted-foreground">
            إدارة المهام والمتابعات لجميع الحالات
          </p>
        </div>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tasks">المهام ({activeTasks?.length || 0})</TabsTrigger>
            <TabsTrigger value="followups">المتابعات ({followups?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            {tasksLoading ? (
              <Card>
                <CardContent className="py-8 text-center">
                  جاري التحميل...
                </CardContent>
              </Card>
            ) : activeTasks?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  لا توجد مهام نشطة
                </CardContent>
              </Card>
            ) : (
              activeTasks?.map((task) => (
                <Card
                  key={task.id}
                  className={`${
                    isOverdue(task.due_date, task.status) ? "border-red-500" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{task.title}</CardTitle>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary"
                          onClick={() => navigate(`/admin/case-profile/${task.case_id}`)}
                        >
                          {task.cases.title_ar}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={statusColors[task.status as keyof typeof statusColors]}>
                          {statusLabels[task.status as keyof typeof statusLabels]}
                        </Badge>
                        <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                          {priorityLabels[task.priority as keyof typeof priorityLabels]}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {task.description && (
                      <p className="text-muted-foreground mb-4">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            {isOverdue(task.due_date, task.status) ? (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <Calendar className="w-4 h-4" />
                            )}
                            <span className={isOverdue(task.due_date, task.status) ? "text-red-500 font-semibold" : ""}>
                              {format(new Date(task.due_date), "dd MMMM yyyy", { locale: ar })}
                            </span>
                          </div>
                        )}
                      </div>
                      {task.status !== "completed" && task.status !== "cancelled" && (
                        <Button
                          onClick={() => handleCompleteTask(task)}
                          size="sm"
                          className="gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          إتمام المهمة
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {completedTasks && completedTasks.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">المهام المكتملة</h2>
                {completedTasks.map((task) => (
                  <Card key={task.id} className="mb-4 opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{task.title}</CardTitle>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-primary"
                            onClick={() => navigate(`/admin/case-profile/${task.case_id}`)}
                          >
                            {task.cases.title_ar}
                          </Button>
                        </div>
                        <Badge className={statusColors[task.status as keyof typeof statusColors]}>
                          {statusLabels[task.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {task.completion_notes && (
                        <p className="text-sm text-muted-foreground">{task.completion_notes}</p>
                      )}
                      {task.completed_at && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                          <Clock className="w-3 h-3" />
                          <span>تم الإتمام في {format(new Date(task.completed_at), "dd MMMM yyyy", { locale: ar })}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="followups" className="space-y-4">
            {followupsLoading ? (
              <Card>
                <CardContent className="py-8 text-center">
                  جاري التحميل...
                </CardContent>
              </Card>
            ) : followups?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  لا توجد متابعات
                </CardContent>
              </Card>
            ) : (
              followups?.map((followup) => (
                <Card key={followup.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {followup.followup_type}
                        </CardTitle>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary"
                          onClick={() => navigate(`/admin/case-profile/${followup.case_id}`)}
                        >
                          {followup.cases.title_ar}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(followup.followup_date), "dd MMMM yyyy", { locale: ar })}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold mb-1">الملاحظات:</h4>
                        <p className="text-muted-foreground">{followup.notes}</p>
                      </div>
                      {followup.next_action && (
                        <div>
                          <h4 className="font-semibold mb-1">الإجراء التالي:</h4>
                          <p className="text-muted-foreground">{followup.next_action}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <TaskCompletionDialog
        open={completionDialogOpen}
        onOpenChange={setCompletionDialogOpen}
        taskId={selectedTask?.id || ""}
        taskTitle={selectedTask?.title || ""}
      />
    </div>
  );
};

export default AdminTasksFollowups;
