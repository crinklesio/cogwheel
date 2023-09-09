/* eslint-disable @typescript-eslint/ban-types */
import { test, expect } from "vitest";
import { machine } from "../../src";
import { Event, State, Action } from "../../src/types";
import { delay } from "../helpers";

type Context = { label: string };
type ToastEvent = Event & { label?: string };

const visibleAction: Action<Context, ToastEvent> = ({
  state,
  event,
  assign,
  send,
}) => {
  assign({ ...state.context, label: event.label || "" });
  send({ type: "CLOSED" }, 10);
};

const config: Record<string, State<Context, ToastEvent>> = {
  visible: {
    CLOSED: "invisible",
    OPENED: "visible",
    _entry: [visibleAction],
  },
  invisible: { OPENED: "visible" },
};

test("Toast - open toast", () => {
  const service = machine({
    init: "invisible",
    states: config,
  });
  expect(service.current).toBe("invisible");
  service.send({ type: "OPENED", label: "message" });
  expect(service.current).toBe("visible");
  expect(service.context.label).toBe("message");
});

test("Toast - auto close-toast", async () => {
  const service = machine({
    init: "invisible",
    states: config,
  });
  expect(service.current).toBe("invisible");
  service.send({ type: "OPENED", label: "message" });
  expect(service.current).toBe("visible");
  await delay(50);
  expect(service.current).toBe("invisible");
});

test("Toast - manual close-toast", () => {
  const service = machine({ init: "invisible", states: config });
  expect(service.current).toBe("invisible");
  service.send({ type: "OPENED", label: "message" });
  expect(service.current).toBe("visible");
  service.send({ type: "CLOSED" });
  expect(service.current).toBe("invisible");
});
