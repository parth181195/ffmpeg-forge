import type {
  VideoFilters,
  AudioFilters,
  ScaleFilter,
  CropFilter,
  PadFilter,
  DeinterlaceFilter,
  VideoDenoiseFilter,
  SharpenFilter,
  ColorFilter,
  RotateFilter,
  FlipFilter,
  WatermarkFilter,
  TextFilter,
  FadeFilter,
  VolumeFilter,
  AudioDenoiseFilter,
  EqualizerFilter,
  TempoFilter,
  PitchFilter,
  FilterSpec,
  UpscalingOptions,
  DownscalingOptions,
} from '../types/filters';

/**
 * Build FFmpeg filter string from filter configuration
 */
export class FilterBuilder {
  /**
   * Build scale filter
   */
  static buildScaleFilter(scale: ScaleFilter): string {
    const parts: string[] = [];

    const width = scale.width ?? -1;
    const height = scale.height ?? -1;
    parts.push(`${width}:${height}`);

    if (scale.algorithm) {
      parts.push(`flags=${scale.algorithm}`);
    }

    if (scale.force_original_aspect_ratio) {
      parts.push(`force_original_aspect_ratio=${scale.force_original_aspect_ratio}`);
    }

    if (scale.force_divisible_by) {
      parts.push(`force_divisible_by=${scale.force_divisible_by}`);
    }

    return `scale=${parts.join(':')}`;
  }

  /**
   * Build crop filter
   */
  static buildCropFilter(crop: CropFilter): string {
    const w = crop.width;
    const h = crop.height;
    const x = crop.x ?? '(iw-w)/2'; // Center by default
    const y = crop.y ?? '(ih-h)/2';

    return `crop=${w}:${h}:${x}:${y}`;
  }

  /**
   * Build pad filter
   */
  static buildPadFilter(pad: PadFilter): string {
    const parts: string[] = [pad.width.toString(), pad.height.toString()];

    if (pad.x !== undefined) parts.push(pad.x.toString());
    if (pad.y !== undefined) parts.push(pad.y.toString());
    if (pad.color) parts.push(pad.color);

    return `pad=${parts.join(':')}`;
  }

  /**
   * Build deinterlace filter
   */
  static buildDeinterlaceFilter(deinterlace: DeinterlaceFilter): string {
    const mode = deinterlace.mode || 'yadif';
    const parts: string[] = [];

    if (deinterlace.parity) {
      const parityMap = { tff: '0', bff: '1', auto: '-1' };
      parts.push(parityMap[deinterlace.parity] || '-1');
    }

    if (deinterlace.deint) {
      const deintMap = { all: '0', interlaced: '1' };
      parts.push(deintMap[deinterlace.deint] || '0');
    }

    return parts.length > 0 ? `${mode}=${parts.join(':')}` : mode;
  }

  /**
   * Build denoise filter
   */
  static buildDenoiseFilter(denoise: VideoDenoiseFilter): string {
    const filter = denoise.filter || 'hqdn3d';
    const parts: string[] = [];

    if (denoise.luma_spatial !== undefined) parts.push(denoise.luma_spatial.toString());
    if (denoise.chroma_spatial !== undefined) parts.push(denoise.chroma_spatial.toString());
    if (denoise.luma_tmp !== undefined) parts.push(denoise.luma_tmp.toString());
    if (denoise.chroma_tmp !== undefined) parts.push(denoise.chroma_tmp.toString());

    return parts.length > 0 ? `${filter}=${parts.join(':')}` : filter;
  }

  /**
   * Build sharpen (unsharp) filter
   */
  static buildSharpenFilter(sharpen: SharpenFilter): string {
    const parts: string[] = [];

    if (sharpen.luma_msize_x !== undefined) parts.push(`luma_msize_x=${sharpen.luma_msize_x}`);
    if (sharpen.luma_msize_y !== undefined) parts.push(`luma_msize_y=${sharpen.luma_msize_y}`);
    if (sharpen.luma_amount !== undefined) parts.push(`luma_amount=${sharpen.luma_amount}`);
    if (sharpen.chroma_msize_x !== undefined)
      parts.push(`chroma_msize_x=${sharpen.chroma_msize_x}`);
    if (sharpen.chroma_msize_y !== undefined)
      parts.push(`chroma_msize_y=${sharpen.chroma_msize_y}`);
    if (sharpen.chroma_amount !== undefined) parts.push(`chroma_amount=${sharpen.chroma_amount}`);

    return parts.length > 0 ? `unsharp=${parts.join(':')}` : 'unsharp';
  }

  /**
   * Build color (eq) filter
   */
  static buildColorFilter(color: ColorFilter): string {
    const parts: string[] = [];

    if (color.brightness !== undefined) parts.push(`brightness=${color.brightness}`);
    if (color.contrast !== undefined) parts.push(`contrast=${color.contrast}`);
    if (color.saturation !== undefined) parts.push(`saturation=${color.saturation}`);
    if (color.gamma !== undefined) parts.push(`gamma=${color.gamma}`);
    if (color.gamma_r !== undefined) parts.push(`gamma_r=${color.gamma_r}`);
    if (color.gamma_g !== undefined) parts.push(`gamma_g=${color.gamma_g}`);
    if (color.gamma_b !== undefined) parts.push(`gamma_b=${color.gamma_b}`);

    return `eq=${parts.join(':')}`;
  }

  /**
   * Build rotate filter
   */
  static buildRotateFilter(rotate: RotateFilter): string {
    const parts: string[] = [`a=${rotate.angle}`];

    if (rotate.fillcolor) parts.push(`fillcolor=${rotate.fillcolor}`);
    if (rotate.bilinear !== undefined) parts.push(`bilinear=${rotate.bilinear ? '1' : '0'}`);

    return `rotate=${parts.join(':')}`;
  }

  /**
   * Build flip filter
   */
  static buildFlipFilter(flip: FlipFilter): string {
    const filters: string[] = [];

    if (flip.horizontal) filters.push('hflip');
    if (flip.vertical) filters.push('vflip');

    return filters.join(',');
  }

  /**
   * Build watermark (overlay) filter
   */
  static buildWatermarkFilter(watermark: WatermarkFilter): string {
    const parts: string[] = [];

    if (watermark.x !== undefined) parts.push(`x=${watermark.x}`);
    if (watermark.y !== undefined) parts.push(`y=${watermark.y}`);

    if (watermark.opacity !== undefined) {
      // Need to use format and colorchannelmixer for opacity
      return `overlay=${parts.join(':')}:format=auto:alpha=${watermark.opacity}`;
    }

    if (watermark.enable) parts.push(`enable='${watermark.enable}'`);

    return `overlay=${parts.join(':')}`;
  }

  /**
   * Build text (drawtext) filter
   */
  static buildTextFilter(text: TextFilter): string {
    const parts: string[] = [`text='${text.text.replace(/'/g, "\\'")}'`];

    if (text.fontfile) parts.push(`fontfile=${text.fontfile}`);
    if (text.fontsize) parts.push(`fontsize=${text.fontsize}`);
    if (text.fontcolor) parts.push(`fontcolor=${text.fontcolor}`);
    if (text.x !== undefined) parts.push(`x=${text.x}`);
    if (text.y !== undefined) parts.push(`y=${text.y}`);
    if (text.shadowcolor) parts.push(`shadowcolor=${text.shadowcolor}`);
    if (text.shadowx !== undefined) parts.push(`shadowx=${text.shadowx}`);
    if (text.shadowy !== undefined) parts.push(`shadowy=${text.shadowy}`);
    if (text.borderw !== undefined) parts.push(`borderw=${text.borderw}`);
    if (text.bordercolor) parts.push(`bordercolor=${text.bordercolor}`);

    return `drawtext=${parts.join(':')}`;
  }

  /**
   * Build fade filter
   */
  static buildFadeFilter(fade: FadeFilter): string {
    const parts: string[] = [`type=${fade.type}`];

    if (fade.start_frame !== undefined) parts.push(`start_frame=${fade.start_frame}`);
    if (fade.nb_frames !== undefined) parts.push(`nb_frames=${fade.nb_frames}`);
    if (fade.start_time !== undefined) parts.push(`start_time=${fade.start_time}`);
    if (fade.duration !== undefined) parts.push(`duration=${fade.duration}`);
    if (fade.color) parts.push(`color=${fade.color}`);

    return `fade=${parts.join(':')}`;
  }

  /**
   * Build volume filter
   */
  static buildVolumeFilter(volume: VolumeFilter): string {
    const parts: string[] = [`volume=${volume.volume}`];

    if (volume.precision) parts.push(`precision=${volume.precision}`);

    return parts.join(':');
  }

  /**
   * Build audio denoise filter
   */
  static buildAudioDenoiseFilter(denoise: AudioDenoiseFilter): string {
    const parts: string[] = [];

    if (denoise.noise_reduction !== undefined) {
      parts.push(`nr=${denoise.noise_reduction}`);
    }

    if (denoise.noise_type) {
      parts.push(`nf=${denoise.noise_type}`);
    }

    return parts.length > 0 ? `afftdn=${parts.join(':')}` : 'afftdn';
  }

  /**
   * Build equalizer filter
   */
  static buildEqualizerFilter(eq: EqualizerFilter): string {
    const parts: string[] = [`f=${eq.frequency}`];

    if (eq.width_type) parts.push(`t=${eq.width_type}`);
    if (eq.width !== undefined) parts.push(`w=${eq.width}`);
    if (eq.gain !== undefined) parts.push(`g=${eq.gain}`);

    return `equalizer=${parts.join(':')}`;
  }

  /**
   * Build tempo filter
   */
  static buildTempoFilter(tempo: TempoFilter): string {
    return `atempo=${tempo.tempo}`;
  }

  /**
   * Build pitch filter
   */
  static buildPitchFilter(pitch: PitchFilter): string {
    return `asetrate=44100*2^(${pitch.pitch}/12),aresample=44100`;
  }

  /**
   * Build upscaling filter chain
   */
  static buildUpscaleFilter(upscale: UpscalingOptions): string[] {
    const filters: string[] = [];

    // Denoise before scaling if requested
    if (upscale.denoiseBeforeScale) {
      filters.push('hqdn3d=4:3:6:4.5');
    }

    // Main scaling
    const scaleFilter = `scale=${upscale.targetWidth}:${upscale.targetHeight}:flags=${upscale.algorithm}`;
    filters.push(scaleFilter);

    // Enhance sharpness after upscaling if requested
    if (upscale.enhanceSharpness) {
      const amount = upscale.sharpnessAmount || 1.0;
      filters.push(`unsharp=5:5:${amount}:5:5:0.0`);
    }

    return filters;
  }

  /**
   * Build downscaling filter chain
   */
  static buildDownscaleFilter(downscale: DownscalingOptions): string[] {
    const filters: string[] = [];

    // Deinterlace before downscaling if requested
    if (downscale.deinterlace) {
      filters.push('yadif=0:-1:0');
    }

    // Use high-quality algorithm for detail preservation
    const algorithm = downscale.preserveDetails ? 'lanczos' : downscale.algorithm;

    const scaleFilter = `scale=${downscale.targetWidth}:${downscale.targetHeight}:flags=${algorithm}`;
    filters.push(scaleFilter);

    return filters;
  }

  /**
   * Build complete video filter chain
   */
  static buildVideoFilters(filters: VideoFilters): string {
    const filterArray: string[] = [];

    // Order matters for video filters!

    // 1. Deinterlace first (if needed)
    if (filters.deinterlace) {
      filterArray.push(this.buildDeinterlaceFilter(filters.deinterlace));
    }

    // 2. Crop before scaling
    if (filters.crop) {
      filterArray.push(this.buildCropFilter(filters.crop));
    }

    // 3. Denoise before scaling
    if (filters.denoise) {
      filterArray.push(this.buildDenoiseFilter(filters.denoise));
    }

    // 4. Scale
    if (filters.scale) {
      filterArray.push(this.buildScaleFilter(filters.scale));
    }

    // 5. Pad after scaling
    if (filters.pad) {
      filterArray.push(this.buildPadFilter(filters.pad));
    }

    // 6. Color correction
    if (filters.color) {
      filterArray.push(this.buildColorFilter(filters.color));
    }

    // 7. Sharpen
    if (filters.sharpen) {
      filterArray.push(this.buildSharpenFilter(filters.sharpen));
    }

    // 8. Transformations
    if (filters.rotate) {
      filterArray.push(this.buildRotateFilter(filters.rotate));
    }

    if (filters.flip) {
      const flipFilters = this.buildFlipFilter(filters.flip);
      if (flipFilters) filterArray.push(flipFilters);
    }

    // 9. Text overlay
    if (filters.text) {
      filterArray.push(this.buildTextFilter(filters.text));
    }

    // 10. Fade effects
    if (filters.fade) {
      filterArray.push(this.buildFadeFilter(filters.fade));
    }

    // 11. Custom filters (last)
    if (filters.custom) {
      filterArray.push(...filters.custom);
    }

    return filterArray.join(',');
  }

  /**
   * Build complete audio filter chain
   */
  static buildAudioFilters(filters: AudioFilters): string {
    const filterArray: string[] = [];

    // 1. Denoise first
    if (filters.denoise) {
      filterArray.push(this.buildAudioDenoiseFilter(filters.denoise));
    }

    // 2. Equalizer
    if (filters.equalizer) {
      filters.equalizer.forEach(eq => {
        filterArray.push(this.buildEqualizerFilter(eq));
      });
    }

    // 3. Tempo changes
    if (filters.tempo) {
      filterArray.push(this.buildTempoFilter(filters.tempo));
    }

    // 4. Pitch changes
    if (filters.pitch) {
      filterArray.push(this.buildPitchFilter(filters.pitch));
    }

    // 5. Volume (should be last before custom)
    if (filters.volume) {
      filterArray.push(this.buildVolumeFilter(filters.volume));
    }

    // 6. Custom filters (last)
    if (filters.custom) {
      filterArray.push(...filters.custom);
    }

    return filterArray.join(',');
  }

  /**
   * Build complex filter graph
   */
  static buildComplexFilter(specs: FilterSpec[]): string {
    return specs
      .map(spec => {
        const inputs = spec.inputs?.map(i => `[${i}]`).join('') || '';
        const outputs = spec.outputs?.map(o => `[${o}]`).join('') || '';

        let filter = spec.filter;
        if (spec.options && Object.keys(spec.options).length > 0) {
          const opts = Object.entries(spec.options)
            .map(([k, v]) => `${k}=${v}`)
            .join(':');
          filter = `${filter}=${opts}`;
        }

        return `${inputs}${filter}${outputs}`;
      })
      .join(';');
  }
}
