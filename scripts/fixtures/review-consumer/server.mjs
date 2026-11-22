import { CommentLayer } from "@sentropic/design-system-svelte";
import { render } from "svelte/server";

export const renderReview = (props) => render(CommentLayer, { props });
