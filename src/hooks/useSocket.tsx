import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export default function useSocket(
  token: string,
  onMessage: (data: any) => void,
) {
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const onMessageRef = useRef(onMessage);

  // 🔊 audio ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ✅ تفعيل الصوت بعد أول click
  useEffect(() => {
    const enableAudio = () => {
      audioRef.current = new Audio("/mixkit-software-interface-back-2575.wav");
      window.removeEventListener("click", enableAudio);
    };

    window.addEventListener("click", enableAudio);

    return () => {
      window.removeEventListener("click", enableAudio);
    };
  }, []);

  // تحديث onMessage
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  // socket
  useEffect(() => {
    if (!token) return;

    const socket = io("https://scout-talent-production-066a.up.railway.app/", {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("notification", (res) => {
      const { data } = res;

      // 🔊 تشغيل الصوت
      audioRef.current?.play().catch(() => {});

      toast.custom((t) => (
        <div
          className={`p-3 rounded shadow ${
            t.visible ? "animate-enter" : "animate-leave"
          }`}
          style={{
            background: "var(--dark-card)",
            color: "#fff",
            borderLeft: "4px solid var(--primary)",
          }}
        >
          <strong>{data.meta.companyName}</strong>
          <p style={{ margin: 0 }}>{data.body}</p>
        </div>
      ));

      onMessageRef.current(res);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return socketRef;
}
