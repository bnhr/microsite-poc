import { stories } from "./data/stories";
import { StoryPlayer } from "./features/story-player/story-player";

export default function App() {
  return (
    <div className="App">
      <StoryPlayer stories={stories} />
    </div>
  )
}