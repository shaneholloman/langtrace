"use client";

import { Create } from "@/components/project/create";
import { Edit } from "@/components/project/edit";
import CardSkeleton from "@/components/shared/card-skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Project } from "@prisma/client";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { RabbitIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "react-query";
import { toast } from "sonner";

export function PageSkeleton() {
  return (
    <div className="w-full flex flex-col">
      <div className="md:px-24 px-12 py-12 flex justify-between bg-muted">
        <h1 className="text-3xl font-semibold">Projects</h1>
        <Create disabled={true} />
      </div>
      <div
        className={cn(
          "md:px-24 px-12 py-12 flex md:flex-row flex-col gap-2 items-center md:items-start"
        )}
      >
        <div
          className={cn(
            "flex w-full gap-12 flex-wrap md:flex-row flex-col md:items-start items-center"
          )}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({
  key,
  project,
  teamId,
}: {
  key: number;
  project: Project;
  teamId: string;
}) {
  const { data: projectStats, isLoading: projectStatsLoading } = useQuery({
    queryKey: ["fetch-project-stats", project.id],
    queryFn: async () => {
      const response = await fetch(
        `/api/stats/project?projectId=${project.id}`
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.message || "Failed to fetch project stats");
      }
      const result = await response.json();
      return result;
    },
    onError: (error) => {
      toast.error("Failed to fetch project stats", {
        description: error instanceof Error ? error.message : String(error),
      });
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return (
    <div className="relative" key={key}>
      <div className="flex items-center flex-row gap-2 absolute top-2 right-2 z-10">
        {!projectStatsLoading &&
          projectStats &&
          projectStats?.totalSpans === 0 && (
            <Link
              href={`/project/${project.id}/traces`}
              className="cursor-pointer flex flex-row gap-2 h-8 text bg-orange-300 hover:bg-orange-400 dark:bg-orange-600 dark:hover:bg-orange-700 p-2 rounded-md"
            >
              <p className="text-xs text-primary font-bold">Setup Project</p>
              <ArrowTopRightIcon className="w-4 h-4 text-primary" />
            </Link>
          )}
        <Edit teamId={teamId} project={project} />
      </div>
      <Link href={`/project/${project.id}/traces`}>
        <Card className="w-full md:w-[380px] h-[190px] shadow-md hover:cursor-pointer transition-all duration-200 ease-in-out hover:border-muted border hover:shadow-lg">
          <CardHeader>
            {project.type === "crewai" && (
              <CardTitle className="capitalize w-full truncate flex items-center gap-1">
                <Image
                  alt="CrewAI Logo"
                  src="/crewai.png"
                  width={60}
                  height={30}
                  className="rounded-md"
                />
                {project.name}
              </CardTitle>
            )}
            {project.type === "dspy" && (
              <CardTitle className="capitalize w-full truncate flex items-center gap-1">
                <Image
                  alt="DSPy Logo"
                  src="/dspy.png"
                  width={50}
                  height={50}
                  className="rounded-md"
                />
                {project.name}
              </CardTitle>
            )}
            {project.type === "default" && (
              <CardTitle className="capitalize w-full truncate">
                {project.name}
              </CardTitle>
            )}
            <CardDescription className="text-sm capitalize text-muted-foreground w-3/4 truncate">
              {project.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!projectStatsLoading && projectStats && (
              <div className="flex flex-row justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row gap-1 items-center">
                    <p className="text-sm text-muted-foreground">Traces</p>
                    <p className="text-sm font-semibold">
                      {projectStats?.totalTraces || 0}
                    </p>
                  </div>
                  <div className="flex flex-row gap-1 items-center">
                    <p className="text-sm text-muted-foreground">Spans</p>
                    <p className="text-sm font-semibold">
                      {projectStats?.totalSpans || 0}
                    </p>
                  </div>
                  <div className="flex flex-row gap-1 items-center">
                    <p className="text-sm text-muted-foreground">Evaluations</p>
                    <p className="text-sm font-semibold">
                      {projectStats?.totalEvaluations || 0}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row gap-1 items-center">
                    <p className="text-sm text-muted-foreground">Datasets</p>
                    <p className="text-sm font-semibold">
                      {projectStats?.totalDatasets || 0}
                    </p>
                  </div>
                  <div className="flex flex-row gap-1 items-center">
                    <p className="text-sm text-muted-foreground">Prompts</p>
                    <p className="text-sm font-semibold">
                      {projectStats?.totalPromptsets || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

export default function PageClient({ email }: { email: string }) {
  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ["fetch-projects-query"],
    queryFn: async () => {
      const response = await fetch(`/api/projects?email=${email}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.message || "Failed to fetch projects");
      }
      const result = await response.json();
      return result;
    },
    onError: (error) => {
      toast.error("Failed to fetch projects", {
        description: error instanceof Error ? error.message : String(error),
      });
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ["fetch-user-query", email],
    queryFn: async () => {
      const response = await fetch(`/api/user?email=${email}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.message || "Failed to fetch user");
      }
      const result = await response.json();
      return result;
    },
    onError: (error) => {
      toast.error("Failed to fetch user", {
        description: error instanceof Error ? error.message : String(error),
      });
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  if (projectsLoading || userLoading) {
    return <PageSkeleton />;
  }

  if (projectsError || userError) {
    return (
      <div className="w-full flex flex-col">
        <div className="md:px-24 px-12 py-12 flex justify-between bg-muted">
          <h1 className="text-3xl font-semibold">Projects</h1>
          <Create teamId={user?.data?.Team?.id} />
        </div>
        <div className="md:px-52 px-12 py-12 flex flex-col items-center justify-center">
          <RabbitIcon size={80} />
          <p className="text-lg text-destructive font-semibold">
            An error occurred while fetching data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // sort projects by created date
  projects?.projects?.sort((a: Project, b: Project) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="w-full flex flex-col">
      <div className="md:px-24 px-12 py-12 flex justify-between bg-muted">
        <h1 className="text-3xl font-semibold">Projects</h1>
        <Create teamId={user?.data?.Team?.id} />
      </div>
      <div
        className={cn(
          "md:px-24 px-12 py-12 flex md:flex-row flex-col gap-2 items-center",
          projects?.projects?.length === 0
            ? "md:items-center"
            : "md:items-start"
        )}
      >
        <div
          className={cn(
            "flex w-full gap-12 flex-wrap",
            projects?.projects?.length === 0
              ? "flex-col items-center"
              : "md:flex-row flex-wrap flex-col md:items-start items-center"
          )}
        >
          {projects?.projects?.length === 0 && (
            <div className="flex flex-col gap-2 items-center">
              <p className="text-2xl text-muted-foreground">Welcome!</p>
              <p className="text-lg text-muted-foreground mb-2">
                Create a new project to get started
              </p>
              <Create teamId={user?.data?.Team?.id} />
            </div>
          )}
          {projects?.projects?.map((project: Project, i: number) => (
            <ProjectCard
              key={i}
              project={project}
              teamId={user?.data?.Team?.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
