import { Controller, Get, Post, Body, Param, Req, UseGuards, Query } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('api/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('submit')
  @UseGuards(JwtGuard)
  async submitReview(@Req() req: any, @Body() body: any) {
    return this.reviewService.submitReview(req.user.id, body);
  }

  @Get('lot/:lotId')
  async getReviewsForLot(@Param('lotId') lotId: string) {
    return this.reviewService.getReviewsForLot(lotId);
  }

  @Get('my')
  @UseGuards(JwtGuard)
  async getMyReviews(@Req() req: any) {
    return this.reviewService.getMyReviews(req.user.id);
  }

  @Get('has-reviewed')
  @UseGuards(JwtGuard)
  async hasReviewed(@Req() req: any, @Query('bookingId') bookingId: string) {
    return { reviewed: await this.reviewService.hasReviewed(req.user.id, bookingId) };
  }

  @Post('service')
  @UseGuards(JwtGuard)
  async submitServiceReview(@Req() req: any, @Body() body: any) {
    return this.reviewService.submitServiceReview(req.user.id, body.rating, body.comment);
  }

  @Get('service')
  async getServiceReviews() {
    return this.reviewService.getServiceReviews();
  }
}
