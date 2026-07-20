"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@bigheadct/ui";

import { reconcileRealtimeMessages, type RealtimeMessage } from "@/lib/message-reconciliation";
import type { WorkspaceRealtimeEvent } from "@/lib/realtime-protocol";

import styles from "./conversations-workspace.module.css";

type Room = {
  id: string;
  name: string;
  description?: string | null;
  isPrivate: boolean;
  createdAt: string;
};
type RoomPage = { rooms: Room[]; counters?: Record<string, number>; nextCursor?: string | null };
type RoomContext = Room;
type FileItem = { id: string; name: string; kind: string; quarantineStatus: string; createdAt: string };
type MessagePage = { messages: RealtimeMessage[]; roomContext?: RoomContext | null };
type RoomMember = { userId: string; isModerator: boolean };
type RoomMemberPage = { room: RoomContext; members: RoomMember[]; canManage?: boolean };
type RoomDetailResponse = { room: RoomContext; members: RoomMember[]; auditTrail?: Record<string, unknown>[] };
type RoomAccessRequest = {
  id: string;
  roomId: string;
  requestedBy: string;
  requestedByEmail?: string | null;
  note?: string | null;
  status: "pending" | "approved" | "rejected" | "canceled";
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
type RoomAccessRequestPage = { room: RoomContext; requests: RoomAccessRequest[] };
type RoomTask = { id: string; title: string; status: string };

class ResponseError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

async function json<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & { detail?: unknown };
  if (!response.ok) {
    throw new ResponseError(
      response.status,
      typeof payload.detail === "string" ? payload.detail : "OperaÃ§Ã£o nÃ£o concluÃ­da."
    );
  }
  return payload;
}

function authorLabel(message: RealtimeMessage) {
  const type = message.metadata?.authorType ?? message.metadata?.author_type;
  const name = message.metadata?.authorName ?? message.metadata?.author_name;
  if (typeof name === "string" && name.trim()) return name;
  if (type === "agent") return "Agente";
  if (type === "system" || !message.authorUserId) return "Sistema";
  return "Membro";
}
function messageStatus(message: RealtimeMessage) {
  if (message.pending) return "Enviando";
  if (message.deletedAt) return "Removida";
  if (message.editedAt) return "Editada";
  return "Enviada";
}
function timeLabel(value: string) {
  const instant = new Date(value);
  return Number.isNaN(instant.getTime())
    ? "HorÃ¡rio indisponÃ­vel"
    : new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(instant);
}

export function ConversationsWorkspace({ mode, currentUserId }: { mode: "list" | "room"; currentUserId?: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId") ?? "";
  const [rooms, setRooms] = useState<Room[]>([]);
  const [counters, setCounters] = useState<Record<string, number>>({});
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [room, setRoom] = useState<RoomContext | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [roomTasks, setRoomTasks] = useState<RoomTask[]>([]);
  const [draft, setDraft] = useState("");
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [roomState, setRoomState] = useState<"idle" | "loading" | "ready" | "error" | "denied">("idle");
  const [fileState, setFileState] = useState<"idle" | "loading" | "ready" | "denied" | "unavailable">("idle");
  const [memberState, setMemberState] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");
  const [taskState, setTaskState] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");
  const [canManageRoom, setCanManageRoom] = useState(false);
  const [joinRequests, setJoinRequests] = useState<RoomAccessRequest[]>([]);
  const [requestNote, setRequestNote] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [realtimeAnnouncement, setRealtimeAnnouncement] = useState("");
  const requestSequence = useRef(0);

  const loadRooms = useCallback(async () => {
    const page = await json<RoomPage>(await fetch("/api/rooms", { cache: "no-store" }));
    setRooms(page.rooms);
    setCounters(page.counters ?? {});
  }, []);

  const loadRoom = useCallback(async (selectedRoomId: string, options: { reset?: boolean } = {}) => {
    const sequence = ++requestSequence.current;
    if (options.reset) {
      setMessages([]);
      setRoom(null);
      setFiles([]);
      setMembers([]);
      setRoomTasks([]);
      setJoinRequests([]);
      setCanManageRoom(false);
      setRoomState("loading");
      setFileState("loading");
      setMemberState("loading");
      setTaskState("loading");
    }

    const [messageResult, fileResult, memberResult, requestResult, taskResult] = await Promise.allSettled([
      fetch(`/api/rooms/${encodeURIComponent(selectedRoomId)}/messages`, { cache: "no-store" }).then((response) =>
        json<MessagePage>(response)
      ),
      fetch(`/api/rooms/${encodeURIComponent(selectedRoomId)}/files`, { cache: "no-store" }).then((response) =>
        json<{ files: FileItem[] }>(response)
      ),
      fetch(`/api/rooms/${encodeURIComponent(selectedRoomId)}/members`, { cache: "no-store" }).then((response) =>
        json<RoomMemberPage>(response)
      ),
      fetch(`/api/rooms/${encodeURIComponent(selectedRoomId)}/join-requests`, { cache: "no-store" }).then((response) =>
        json<RoomAccessRequestPage>(response)
      ),
      fetch(`/api/tasks?roomId=${encodeURIComponent(selectedRoomId)}`, { cache: "no-store" }).then((response) =>
        json<{ items: RoomTask[] }>(response)
      )
    ]);
    if (sequence !== requestSequence.current) return;

    if (fileResult.status === "fulfilled") {
      setFiles(fileResult.value.files);
      setFileState("ready");
    } else {
      setFiles([]);
      setFileState(fileResult.reason instanceof ResponseError && fileResult.reason.status === 403 ? "denied" : "unavailable");
    }

    if (memberResult.status === "fulfilled") {
      setMembers(memberResult.value.members);
      setMemberState("ready");
      setCanManageRoom(memberResult.value.canManage === true);
    } else {
      setMembers([]);
      setMemberState("unavailable");
      setCanManageRoom(false);
    }

    if (requestResult.status === "fulfilled" && memberResult.status === "fulfilled" && memberResult.value.canManage === true) {
      setJoinRequests(requestResult.value.requests);
    } else {
      setJoinRequests([]);
    }

    if (taskResult.status === "fulfilled") {
      setRoomTasks(taskResult.value.items);
      setTaskState("ready");
    } else {
      setRoomTasks([]);
      setTaskState("unavailable");
    }

    if (messageResult.status === "fulfilled") {
      setMessages((current) =>
        reconcileRealtimeMessages(current.filter((item) => item.roomId === selectedRoomId && item.pending), messageResult.value.messages)
      );
      setRoom(messageResult.value.roomContext ?? null);
      setRoomState("ready");
    } else {
      setMessages([]);
      setRoom(null);
      setFiles([]);
      setMembers([]);
      setRoomTasks([]);
      setJoinRequests([]);
      setCanManageRoom(false);
      setFileState("idle");
      setMemberState("idle");
      setTaskState("idle");
      if (messageResult.reason instanceof ResponseError && messageResult.reason.status === 403) {
        setRoomState("denied");
        setStatus("Solicite acesso para entrar nesta conversa.");
        return;
      }
      setRoomState("error");
      throw messageResult.reason;
    }
  }, []);

  useEffect(() => {
    void loadRooms().catch((error: unknown) => setStatus(errorMessage(error, "NÃ£o foi possÃ­vel carregar as salas.")));
  }, [loadRooms]);

  useEffect(() => {
    if (mode !== "room" || !roomId) return;
    setStatus("");
    void loadRoom(roomId, { reset: true }).catch((error: unknown) =>
      setStatus(errorMessage(error, "NÃ£o foi possÃ­vel abrir a conversa."))
    );
  }, [loadRoom, mode, roomId]);

  useEffect(() => {
    setOnline(navigator.onLine !== false);
    const key = roomId ? `bighead:draft:${roomId}` : "";
    if (key) setDraft(localStorage.getItem(key) ?? "");

    const onOffline = () => setOnline(false);
    const onOnline = () => {
      setOnline(true);
      if (roomId) void loadRoom(roomId).catch((error: unknown) => setStatus(errorMessage(error, "NÃ£o foi possÃ­vel atualizar a conversa.")));
    };

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [loadRoom, roomId]);

  useEffect(() => {
    if (mode !== "room" || !roomId) return;
    const onRealtime = (event: Event) => {
      const detail = (event as CustomEvent<WorkspaceRealtimeEvent>).detail;
      if (detail?.table === "messages") {
        void loadRoom(roomId)
          .then(() => setRealtimeAnnouncement("Conversa atualizada com novas mensagens."))
          .catch(() => undefined);
      }
    };
    window.addEventListener("bighead:realtime-event", onRealtime);
    return () => window.removeEventListener("bighead:realtime-event", onRealtime);
  }, [loadRoom, mode, roomId]);

  function updateDraft(value: string) {
    setDraft(value);
    if (roomId) localStorage.setItem(`bighead:draft:${roomId}`, value);
  }

  function isCurrentUser(member: RoomMember) {
    return Boolean(currentUserId && member.userId === currentUserId);
  }

  async function requestAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!roomId) return;
    setPending(true);
    setStatus("");
    const form = new FormData(event.currentTarget);
    try {
      await json<RoomAccessRequestPage>(
        await fetch(`/api/rooms/${encodeURIComponent(roomId)}/join-requests`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ note: String(form.get("note") ?? "").trim() || null })
        })
      );
      setRequestNote("");
      setStatus("Pedido de acesso enviado.");
    } catch (error) {
      setStatus(errorMessage(error, "NÃ£o foi possÃ­vel solicitar acesso."));
    } finally {
      setPending(false);
    }
  }

  async function inviteMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!roomId) return;
    setPending(true);
    setStatus("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    try {
      await json<RoomDetailResponse>(
        await fetch(`/api/rooms/${encodeURIComponent(roomId)}/members`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email })
        })
      );
      setInviteEmail("");
      setStatus("Membro convidado.");
      await loadRoom(roomId);
    } catch (error) {
      setStatus(errorMessage(error, "NÃ£o foi possÃ­vel convidar o membro."));
    } finally {
      setPending(false);
    }
  }

  async function reviewRequest(requestId: string, statusValue: "approved" | "rejected") {
    if (!roomId) return;
    setPending(true);
    setStatus("");
    try {
      await json<RoomDetailResponse>(
        await fetch(`/api/rooms/${encodeURIComponent(roomId)}/join-requests/${encodeURIComponent(requestId)}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status: statusValue })
        })
      );
      setStatus(statusValue === "approved" ? "Pedido aprovado." : "Pedido recusado.");
      await loadRoom(roomId);
    } catch (error) {
      setStatus(errorMessage(error, "NÃ£o foi possÃ­vel revisar o pedido."));
    } finally {
      setPending(false);
    }
  }

  async function createRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus("");
    const form = new FormData(event.currentTarget);
    try {
      const created = await json<Room>(
        await fetch("/api/rooms", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: form.get("name"),
            description: form.get("description"),
            isPrivate: form.get("isPrivate") === "on"
          })
        })
      );
      await loadRooms();
      router.push(`/colaboracao/sala?roomId=${encodeURIComponent(created.id)}`);
    } catch (error) {
      setStatus(errorMessage(error, "NÃ£o foi possÃ­vel criar a sala."));
    } finally {
      setPending(false);
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !roomId || !online) return;
    const clientId = crypto.randomUUID();
    const optimistic: RealtimeMessage = {
      id: `pending-${clientId}`,
      roomId,
      clientId,
      authorUserId: "local",
      body,
      metadata: { authorName: "VocÃª", authorType: "human" },
      createdAt: new Date().toISOString(),
      pending: true
    };
    setMessages((current) => reconcileRealtimeMessages(current, [optimistic]));
    setPending(true);
    setStatus("");
    try {
      const persisted = await json<RealtimeMessage>(
        await fetch(`/api/rooms/${encodeURIComponent(roomId)}/messages`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ body, clientId })
        })
      );
      setMessages((current) => reconcileRealtimeMessages(current, [{ ...persisted, pending: false }]));
      updateDraft("");
      setStatus("Mensagem enviada.");
    } catch (error) {
      setMessages((current) => current.filter((item) => item.clientId !== clientId));
      setStatus(errorMessage(error, "NÃ£o foi possÃ­vel enviar. Seu rascunho foi preservado."));
    } finally {
      setPending(false);
    }
  }

  const visibleMessages = useMemo(
    () => messages.filter((message) => message.roomId === roomId),
    [messages, roomId]
  );
  const roomSummary = useMemo(
    () => ({
      messages: visibleMessages.length,
      members: members.length,
      tasks: roomTasks.length,
      files: files.length
    }),
    [files.length, members.length, roomTasks.length, visibleMessages.length]
  );

  if (mode === "list") {
    return (
      <section className={styles.page} aria-labelledby="rooms-title">
        <header className={styles.heading}>
          <div>
            <span>Conversas</span>
            <h1 id="rooms-title">Salas</h1>
            <p>Escolha um espaÃ§o de colaboraÃ§Ã£o ou crie uma nova sala de trabalho.</p>
          </div>
          <strong>{counters.total ?? rooms.length} salas</strong>
        </header>

        <div className={styles.summaryBar} aria-label="Resumo das salas">
          <SummaryPill label="PÃºblicas" value={String(counters.public ?? rooms.filter((room) => !room.isPrivate).length)} />
          <SummaryPill label="Privadas" value={String(counters.private ?? rooms.filter((room) => room.isPrivate).length)} />
          <SummaryPill label="Total" value={String(counters.total ?? rooms.length)} />
          <SummaryPill label="Ativas" value={String(counters.active ?? rooms.length)} />
        </div>

        {status ? <p className={styles.feedback} role="status">{status}</p> : null}

        <div className={styles.roomsLayout}>
          <div className={styles.roomList} aria-label="Salas disponÃ­veis">
            {rooms.map((item) => (
              <Link href={`/colaboracao/sala?roomId=${encodeURIComponent(item.id)}`} key={item.id} prefetch={false}>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.description || "Sem descriÃ§Ã£o"}</small>
                </span>
                <em>{item.isPrivate ? "Privada" : "Aberta"}</em>
              </Link>
            ))}
            {rooms.length === 0 ? (
              <div className={styles.empty}>
                <strong>Nenhuma sala disponÃ­vel</strong>
                <span>Crie a primeira sala para iniciar uma conversa.</span>
              </div>
            ) : null}
          </div>

          <form className={styles.createRoom} onSubmit={(event) => { void createRoom(event); }}>
            <h2>Criar sala</h2>
            <p>Defina um nome direto e indique se a sala serÃ¡ privada.</p>
            <label>
              Nome
              <input maxLength={160} name="name" required />
            </label>
            <label>
              DescriÃ§Ã£o
              <textarea maxLength={2000} name="description" placeholder="Descreva o uso desta sala em uma frase." />
            </label>
            <label className={styles.check}>
              <input name="isPrivate" type="checkbox" />
              Somente convidados
            </label>
            <Button disabled={pending} type="submit">
              {pending ? "Criando..." : "Criar e abrir"}
            </Button>
          </form>
        </div>
      </section>
    );
  }

  if (!roomId) {
    return (
      <section className={styles.page}>
        <div className={styles.empty}>
          <strong>Selecione uma sala</strong>
          <span>Abra uma sala para acompanhar mensagens e arquivos.</span>
          <Link href="/colaboracao/salas">Ver salas</Link>
        </div>
      </section>
    );
  }

  if (roomState === "denied") {
    return (
      <section className={styles.page} aria-labelledby="conversation-title">
        <header className={styles.conversationHeader}>
          <div>
            <Link href="/colaboracao/salas">Salas</Link>
            <h1 id="conversation-title">Sala restrita</h1>
            <p>Voce pode solicitar entrada para esta conversa privada.</p>
          </div>
          <span>{online ? "Online" : "Offline Â· rascunho salvo"}</span>
        </header>

        {status ? <p className={styles.feedback} role="status">{status}</p> : null}

        <div className={styles.roomsLayout}>
          <div className={styles.empty}>
            <strong>Acesso necessÃ¡rio</strong>
            <span>Esta sala nÃ£o estÃ¡ liberada para o seu usuÃ¡rio. Solicite acesso e aguarde a aprovaÃ§Ã£o de um moderador.</span>
          </div>

          <form className={styles.createRoom} onSubmit={(event) => { void requestAccess(event); }}>
            <h2>Solicitar acesso</h2>
            <p>Escreva uma observaÃ§Ã£o curta para contextualizar o pedido.</p>
            <label>
              ObservaÃ§Ã£o
              <textarea
                maxLength={1000}
                onChange={(event) => setRequestNote(event.target.value)}
                placeholder="Explique em uma frase por que vocÃª precisa entrar."
                name="note"
                value={requestNote}
              />
            </label>
            <Button disabled={pending} type="submit">
              {pending ? "Enviando..." : "Solicitar acesso"}
            </Button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.conversation} aria-labelledby="conversation-title">
      <header className={styles.conversationHeader}>
        <div>
          <Link href="/colaboracao/salas">Salas</Link>
          <h1 id="conversation-title">{room?.name ?? "Conversa"}</h1>
          <p>{room?.description || "Sala sem descriÃ§Ã£o"}</p>
        </div>
        <span>{online ? "Online" : "Offline Â· rascunho salvo"}</span>
      </header>

      <div className={styles.summaryBar} aria-label="Resumo da sala">
        <SummaryPill label="Mensagens" value={String(roomSummary.messages)} />
        <SummaryPill label="Membros" value={String(roomSummary.members)} />
        <SummaryPill label="Tarefas" value={String(roomSummary.tasks)} />
        <SummaryPill label="Arquivos" value={String(roomSummary.files)} />
      </div>

      <div className={styles.conversationGrid}>
        <div className={styles.timelineColumn}>
          <p className={styles.srOnly} aria-live="polite">
            {realtimeAnnouncement}
          </p>
          {status ? <p className={styles.feedback} role="status">{status}</p> : null}
          {roomState === "loading" ? (
            <div className={styles.empty}>
              <strong>Carregando conversa...</strong>
              <span>Buscando o contexto desta sala.</span>
            </div>
          ) : null}
          {roomState === "error" ? (
            <div className={styles.empty}>
              <strong>Conversa indisponÃ­vel</strong>
              <span>Verifique seu acesso ou escolha outra sala.</span>
              <Link href="/colaboracao/salas">Voltar para salas</Link>
            </div>
          ) : null}

          <div aria-label="Mensagens da sala" className={styles.timeline} role="log">
            {visibleMessages.map((message) => (
              <article data-client-id={message.clientId} data-message-id={message.id} key={message.id}>
                <div>
                  <strong>{authorLabel(message)}</strong>
                  <time dateTime={message.createdAt}>{timeLabel(message.createdAt)}</time>
                </div>
                <p>{message.deletedAt ? "Mensagem removida" : message.body}</p>
                <small>{messageStatus(message)}</small>
                {!message.deletedAt && !message.pending ? (
                  <Link
                    aria-label="Criar tarefa a partir da mensagem"
                    href={`/tarefas/criar?roomId=${encodeURIComponent(roomId)}&sourceMessageId=${encodeURIComponent(message.id)}`}
                    prefetch={false}
                  >
                    Criar tarefa
                  </Link>
                ) : null}
              </article>
            ))}
            {roomState === "ready" && visibleMessages.length === 0 ? (
              <div className={styles.empty}>
                <strong>Comece a conversa</strong>
                <span>Envie a primeira mensagem para esta sala.</span>
              </div>
            ) : null}
          </div>

          <form className={styles.composer} onSubmit={(event) => { void sendMessage(event); }}>
            <label htmlFor="conversation-draft">Mensagem</label>
            <textarea
              id="conversation-draft"
              maxLength={100000}
              onChange={(event) => updateDraft(event.target.value)}
              placeholder="Escreva uma mensagem curta e objetiva."
              value={draft}
            />
            <div>
              <span>
                {!online ? "O rascunho serÃ¡ mantido neste dispositivo." : "Seu rascunho fica salvo neste dispositivo."}
              </span>
              <Button disabled={pending || !online || roomState !== "ready" || !draft.trim()} type="submit">
                {pending ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </form>
        </div>

        <aside className={styles.inspector} aria-label="Contexto da sala">
          <section>
            <h2>Sobre</h2>
            <p>{room?.description || "Sem descriÃ§Ã£o."}</p>
            <span>{room?.isPrivate ? "Sala privada" : "Sala aberta"}</span>
          </section>
          <section>
            <h2>Membros</h2>
            {memberState === "loading" ? <p>Carregando membros...</p> : null}
            {memberState === "unavailable" ? <p>Membros temporariamente indisponÃ­veis.</p> : null}
            {memberState === "ready" && members.length ? (
              <ul>
                {members.map((member) => (
                  <li key={member.userId}>
                    <strong>{isCurrentUser(member) ? "Voce" : member.userId}</strong>
                    <span>{member.isModerator ? "Moderador" : "Membro"}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {memberState === "ready" && members.length === 0 ? <p>Nenhum membro nesta sala.</p> : null}
          </section>
          {canManageRoom ? (
            <section>
              <h2>Convidar membro</h2>
              <p>Adicione um usuário cadastrado no Auth e já vinculado ao tenant.</p>
              <form onSubmit={(event) => { void inviteMember(event); }}>
                <label>
                  E-mail
                  <input
                    autoComplete="email"
                    name="email"
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="pessoa@empresa.com"
                    type="email"
                    value={inviteEmail}
                  />
                </label>
                <Button disabled={pending || !inviteEmail.trim()} type="submit">
                  {pending ? "Convidando..." : "Convidar"}
                </Button>
              </form>
            </section>
          ) : null}
          {canManageRoom ? (
            <section>
              <h2>Pedidos de acesso</h2>
              {joinRequests.length ? (
                <ul>
                  {joinRequests.map((request) => (
                    <li key={request.id}>
                      <strong>{request.requestedByEmail ?? request.requestedBy}</strong>
                      <span>{request.note || "Sem observação"}</span>
                      <div>
                        <Button disabled={pending} onClick={() => { void reviewRequest(request.id, "approved"); }} type="button">
                          Aprovar
                        </Button>
                        <Button disabled={pending} onClick={() => { void reviewRequest(request.id, "rejected"); }} type="button" tone="secondary">
                          Recusar
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum pedido pendente.</p>
              )}
            </section>
          ) : null}
          <section>
            <h2>Tarefas</h2>
            {taskState === "loading" ? <p>Carregando tarefas...</p> : null}
            {taskState === "unavailable" ? <p>Tarefas temporariamente indisponÃ­veis.</p> : null}
            {taskState === "ready" && roomTasks.length ? (
              <ul>
                {roomTasks.map((task) => (
                  <li key={task.id}>
                    <Link href={`/tarefas/detalhe?taskId=${encodeURIComponent(task.id)}`}>
                      <strong>{task.title}</strong>
                      <span>{task.status.replaceAll("_", " ")}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            {taskState === "ready" && roomTasks.length === 0 ? <p>Nenhuma tarefa vinculada.</p> : null}
          </section>
          <section>
            <h2>Arquivos</h2>
            {fileState === "loading" ? <p>Carregando arquivos...</p> : null}
            {fileState === "denied" ? <p>Voce nao tem permissao para ver os arquivos desta sala.</p> : null}
            {fileState === "unavailable" ? <p>Arquivos temporariamente indisponÃ­veis.</p> : null}
            {fileState === "ready" && files.length ? (
              <ul>
                {files.map((file) => (
                  <li key={file.id}>
                    <strong>{file.name}</strong>
                    <span>{file.quarantineStatus === "clean" ? "DisponÃ­vel" : "Em anÃ¡lise"}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {fileState === "ready" && files.length === 0 ? <p>Nenhum arquivo nesta sala.</p> : null}
          </section>
        </aside>
      </div>
    </section>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.summaryPill}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}


