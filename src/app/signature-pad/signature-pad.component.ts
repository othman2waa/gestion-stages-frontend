import { Component, ElementRef, ViewChild, Output, EventEmitter, Input, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.scss']
})
export class SignaturePadComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() label = 'Votre signature';
  @Input() width = 440;
  @Input() height = 160;
  @Output() signatureConfirmed = new EventEmitter<string>();

  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  signed = false;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.width;
    canvas.height = this.height;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.strokeStyle = '#1E293B';
    this.ctx.lineWidth = 2.5;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  startDraw(e: MouseEvent): void {
    this.drawing = true;
    const pos = this.getPos(e);
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }

  draw(e: MouseEvent): void {
    if (!this.drawing) return;
    const pos = this.getPos(e);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    this.signed = true;
  }

  startDrawTouch(e: TouchEvent): void {
    e.preventDefault();
    this.drawing = true;
    const pos = this.getTouchPos(e);
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }

  drawTouch(e: TouchEvent): void {
    e.preventDefault();
    if (!this.drawing) return;
    const pos = this.getTouchPos(e);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    this.signed = true;
  }

  stopDraw(): void { this.drawing = false; }

  effacer(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.signed = false;
  }

  confirmer(): void {
    const dataUrl = this.canvasRef.nativeElement.toDataURL('image/png');
    this.signatureConfirmed.emit(dataUrl);
  }

  private getPos(e: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private getTouchPos(e: TouchEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
  }
}