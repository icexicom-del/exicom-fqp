import dynamic from "next/dynamic";

// Firebase must only run on the client; ssr: false ensures that.
const FQPApp = dynamic(() => import("./FQPApp"), { ssr: false });

export default function Page() {
  return <FQPApp />;
}
