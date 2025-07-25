import React from "react";

export default function AnswerCard({ answer }) {
  return (
    <div style={{ border: "1px solid #d0eaff", borderRadius: 8, padding: 16, background: "#f7fbff", marginBottom: 16 }}>
      <div style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>Answer</div>
      <div style={{ fontSize: 15, marginBottom: 8 }}>{answer.answer}</div>
      {answer.type && (
        <div style={{ fontSize: 12, color: "#0070f3" }}>Type: {answer.type}</div>
      )}
      {answer.score !== null && answer.score !== undefined && (
        <div style={{ fontSize: 12, color: "#888" }}>Score: {answer.score}</div>
      )}
      {answer.document_ids && answer.document_ids.length > 0 && (
        <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
          References: {answer.document_ids.map((id, i) => (
            <span key={id}>[{i + 1}] </span>
          ))}
        </div>
      )}
    </div>
  );
}
