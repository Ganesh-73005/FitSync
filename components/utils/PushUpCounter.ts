import * as pose from '@mediapipe/pose';

export class PushUpCounter {
  private count: number = 0;
  private isDown: boolean = false;
  private pose: pose.Pose;

  constructor() {
    this.pose = new pose.Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    this.pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.pose.onResults(this.onResults.bind(this));
  }

  public async processFrame(frame: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): Promise<number> {
    try {
      await this.pose.send({ image: frame });
      return this.count;
    } catch (error) {
      console.error("Error processing frame:", error);
      return this.count;
    }
  }

  private onResults(results: pose.Results): void {
    if (!results.poseLandmarks) return;

    const leftShoulder = results.poseLandmarks[11]?.y;
    const rightShoulder = results.poseLandmarks[12]?.y;
    const leftHip = results.poseLandmarks[23]?.y;
    const rightHip = results.poseLandmarks[24]?.y;

    if ([leftShoulder, rightShoulder, leftHip, rightHip].some((point) => point == null)) {
      console.warn("Missing landmarks in results.");
      return;
    }

    const shoulders = (leftShoulder! + rightShoulder!) / 2;
    const hips = (leftHip! + rightHip!) / 2;

    const threshold = 0.15; // Adjust based on calibration
    if (shoulders > hips + threshold && !this.isDown) {
      this.isDown = true;
    } else if (shoulders < hips - threshold && this.isDown) {
      this.isDown = false;
      this.count++;
    }
  }

  public getCount(): number {
    return this.count;
  }

  public reset(): void {
    this.count = 0;
    this.isDown = false;
  }
}
